use actix_web::{HttpResponse, Responder};
use http_body_util::{BodyExt as _, Empty};
use hyper::{body::Bytes, Request, StatusCode};
use hyper_util::rt::TokioIo;
use serde::{Deserialize, Serialize};
use std::{env, ops::Range};
use tlsn_core::proof::TlsProof;
use tokio::io::AsyncWriteExt as _;
use tokio_util::compat::{FuturesAsyncReadCompatExt, TokioAsyncReadCompatExt};
use tracing::debug;

use tlsn_prover::tls::{Prover, ProverConfig};

use crate::{format, setup_notary_connection};

// Setting of the application server
const SERVER_DOMAIN: &str = "discord.com";

// Setting of the notary server
const NOTARY_HOST: &str = "127.0.0.1";
const NOTARY_PORT: u16 = 7047;

// Configuration of notarization
const NOTARY_MAX_TRANSCRIPT_SIZE: usize = 16384;

/// Response object of the /session API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotarizationSessionResponse {
    pub session_id: String,
}

/// Request object of the /session API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotarizationSessionRequest {
    pub client_type: ClientType,
    /// Maximum transcript size in bytes
    pub max_transcript_size: Option<usize>,
}

/// Types of client that the prover is using
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum ClientType {
    /// Client that has access to the transport layer
    Tcp,
    /// Client that cannot directly access transport layer, e.g. browser extension
    Websocket,
}

pub async fn notarize() -> impl Responder {
    // Load secret variables frome environment for discord server connection
    dotenv::dotenv().ok();
    let channel_id = env::var("CHANNEL_ID").unwrap();
    let auth_token = env::var("AUTHORIZATION").unwrap();
    let user_agent = env::var("USER_AGENT").unwrap();

    let (notary_tls_socket, session_id) =
        setup_notary_connection(NOTARY_HOST, NOTARY_PORT, Some(NOTARY_MAX_TRANSCRIPT_SIZE)).await;

    // Basic default prover config using the session_id returned from /session endpoint just now
    let config = ProverConfig::builder()
        .id(session_id)
        .server_dns(SERVER_DOMAIN)
        .build()
        .unwrap();

    // Create a new prover and set up the MPC backend.
    let prover = Prover::new(config)
        .setup(notary_tls_socket.compat())
        .await
        .unwrap();

    let client_socket = tokio::net::TcpStream::connect((SERVER_DOMAIN, 443))
        .await
        .unwrap();
    println!("Connected to the Notary");

    // Bind the Prover to server connection
    let (tls_connection, prover_fut) = prover.connect(client_socket.compat()).await.unwrap();

    // Spawn the Prover to be run concurrently
    let prover_task = tokio::spawn(prover_fut);

    // Attach the hyper HTTP client to the TLS connection
    let (mut request_sender, connection) =
        hyper::client::conn::http1::handshake(TokioIo::new(tls_connection.compat()))
            .await
            .unwrap();

    // Spawn the HTTP task to be run concurrently
    let connection_task = tokio::spawn(connection.without_shutdown());

    // Build the HTTP request to fetch the DMs
    let request = Request::builder()
        .uri(format!(
            "https://{SERVER_DOMAIN}/api/v9/channels/{channel_id}/messages?limit=2"
        ))
        .header("Host", SERVER_DOMAIN)
        .header("Accept", "*/*")
        .header("Accept-Language", "en-US,en;q=0.5")
        .header("Accept-Encoding", "identity")
        .header("User-Agent", user_agent)
        .header("Authorization", &auth_token)
        .header("Connection", "close")
        .body(Empty::<Bytes>::new())
        .unwrap();

    debug!("Sending request");
    println!("Starting an MPC TLS connection with the Discord server");

    let response = request_sender.send_request(request).await.unwrap();

    println!("response: {:#?}", response);

    debug!("Sent request");

    assert!(response.status() == StatusCode::OK, "{}", response.status());

    debug!("Request OK");
    println!("Got a response from the Discord server");

    // Pretty printing :)
    let payload = response.into_body().collect().await.unwrap().to_bytes();
    let parsed =
        serde_json::from_str::<serde_json::Value>(&String::from_utf8_lossy(&payload)).unwrap();
    debug!("{}", serde_json::to_string_pretty(&parsed).unwrap());

    // Close the connection to the server
    // let mut client_socket = connection_task.await.unwrap().unwrap().io.into_inner();
    // client_socket.close().await.unwrap();
    let mut client_socket = connection_task.await.unwrap().unwrap().io.into_inner();
    client_socket.shutdown().await.unwrap();
    // The Prover task should be done now, so we can grab it.
    let prover = prover_task.await.unwrap().unwrap();

    // Prepare for notarization
    let mut prover = prover.start_notarize();

    // Identify the ranges in the transcript that contain secrets
    let (public_ranges, private_ranges) =
        find_ranges(prover.sent_transcript().data(), &[auth_token.as_bytes()]);

    let recv_len = prover.recv_transcript().data().len();

    let builder = prover.commitment_builder();

    // Collect commitment ids for the outbound transcript
    let mut commitment_ids = public_ranges
        .iter()
        .chain(private_ranges.iter())
        .map(|range| builder.commit_sent(range).unwrap())
        .collect::<Vec<_>>();

    // Commit to the full received transcript in one shot, as we don't need to redact anything
    commitment_ids.push(builder.commit_recv(&(0..recv_len)).unwrap());

    // Finalize, returning the notarized session
    let notarized_session = prover.finalize().await.unwrap();

    debug!("Notarization complete!");
    println!("Notarization completed successfully!");

    let session_proof = notarized_session.session_proof();

    let mut proof_builder = notarized_session.data().build_substrings_proof();

    // Reveal everything but the auth token (which was assigned commitment id 2)
    proof_builder.reveal_by_id(commitment_ids[0]).unwrap();
    proof_builder.reveal_by_id(commitment_ids[1]).unwrap();
    proof_builder.reveal_by_id(commitment_ids[3]).unwrap();

    let substrings_proof = proof_builder.build().unwrap();

    let proof = TlsProof {
        session: session_proof,
        substrings: substrings_proof,
    };

    let json_proof = serde_json::json!(proof);

    let readable_proof = format(json_proof).unwrap();

    let res = serde_json::json!({
      "proof": proof,
      "readable_proof": readable_proof,
      // "notarized_session": notarized_session
    });

    HttpResponse::Ok()
        .content_type("application/json")
        .body(serde_json::to_string_pretty(&res).unwrap())
}

/// Find the ranges of the public and private parts of a sequence.
/// Returns a tuple of `(public, private)` ranges.
fn find_ranges(seq: &[u8], sub_seq: &[&[u8]]) -> (Vec<Range<usize>>, Vec<Range<usize>>) {
    let mut private_ranges = Vec::new();
    for s in sub_seq {
        for (idx, w) in seq.windows(s.len()).enumerate() {
            if w == *s {
                private_ranges.push(idx..(idx + w.len()));
            }
        }
    }

    let mut sorted_ranges = private_ranges.clone();
    sorted_ranges.sort_by_key(|r| r.start);

    let mut public_ranges = Vec::new();
    let mut last_end = 0;
    for r in sorted_ranges {
        if r.start > last_end {
            public_ranges.push(last_end..r.start);
        }
        last_end = r.end;
    }

    if last_end < seq.len() {
        public_ranges.push(last_end..seq.len());
    }

    (public_ranges, private_ranges)
}
