use actix_web::{web, HttpResponse, Responder};
use http_body_util::Empty;
use hyper::{body::Bytes, Request, StatusCode};
use hyper_util::rt::TokioIo;
use serde::{Deserialize, Serialize};
use std::{env, ops::Range};
use tlsn_core::proof::TlsProof;
use tokio::io::AsyncWriteExt as _;
use tokio_util::compat::{FuturesAsyncReadCompatExt, TokioAsyncReadCompatExt};
use tracing::debug;

use tlsn_prover::tls::{Prover, ProverConfig};

use crate::setup_notary_connection;

use crate::format;

// Setting of the notary server
const NOTARY_HOST: &str = "127.0.0.1";
const NOTARY_PORT: u16 = 7047;

// Setting of the server
const SERVER_DOMAIN: &str = "api.etherscan.io";
const ROUTE: &str = "api";

// Configuration of notarization
const NOTARY_MAX_TRANSCRIPT_SIZE: usize = 16384;

/// Response object of the /session API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NotarizationSessionResponse {
    pub session_id: String,
}

/// Request object of the /session API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NotarizationSessionRequest {
    pub client_type: ClientType,
    /// Maximum transcript size in bytes
    pub max_transcript_size: Option<usize>,
}

/// Types of client that the prover is using
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
enum ClientType {
    /// Client that has access to the transport layer
    Tcp,
    /// Client that cannot directly access transport layer, e.g. browser extension
    Websocket,
}

#[derive(serde::Deserialize)]
pub struct EtherscanQueryParams {
    contract_address: String,
    address: String,
}

pub async fn notarize(query_params: web::Query<EtherscanQueryParams>) -> impl Responder {
    tracing_subscriber::fmt::init();

    let contract_address = &query_params.contract_address;
    let address = &query_params.address;

    dotenv::dotenv().ok();
    let api_key = env::var("ETHERSCAN_API_KEY").unwrap();

    let (notary_tls_socket, session_id) =
        setup_notary_connection(NOTARY_HOST, NOTARY_PORT, Some(NOTARY_MAX_TRANSCRIPT_SIZE)).await;

    let config = ProverConfig::builder()
        .id(session_id)
        .server_dns(SERVER_DOMAIN)
        .build()
        .unwrap();

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

    let formatted_uri = format!(
    "https://{}/{}/?module=account&action=tokenbalance&contractaddress={}&address={}&tag=latest&apikey={}",
    SERVER_DOMAIN, ROUTE, contract_address, address, api_key
    );

    let request = Request::builder()
        .uri(formatted_uri)
        .header("Host", SERVER_DOMAIN)
        .header("User-Agent", "zkNotary")
        .header("Accept", "*/*")
        .body(Empty::<Bytes>::new())
        .unwrap();

    debug!("Sending request");
    println!("Starting an MPC TLS connection with the Etherscan API");

    println!("request: {:#?}", request);

    let response = request_sender.send_request(request).await.unwrap();

    println!("response: {:#?}", response);

    debug!("Sent request");

    assert!(response.status() == StatusCode::OK);

    debug!("Request OK");
    println!("Got a response from Etherscan API");

    // Prover Task
    let prover = prover_task.await.unwrap().unwrap();

    let mut prover = prover.start_notarize();

    // Identify the ranges in the transcript that contain secrets
    let (public_ranges, private_ranges) =
        find_ranges(prover.sent_transcript().data(), &[api_key.as_bytes()]);

    let recv_len = prover.recv_transcript().data().len();

    let builder = prover.commitment_builder();

    let mut commitment_ids = public_ranges
        .iter()
        .chain(private_ranges.iter())
        .map(|range| builder.commit_sent(range).unwrap())
        .collect::<Vec<_>>();

    commitment_ids.push(builder.commit_recv(&(0..recv_len)).unwrap());

    let notarized_session = prover.finalize().await.unwrap();

    debug!("Notarization complete!");
    println!("Notarization completed successfully!");

    let session_proof = notarized_session.session_proof();
    let mut proof_builder = notarized_session.data().build_substrings_proof();

    proof_builder.reveal_by_id(commitment_ids[0]).unwrap();
    proof_builder.reveal_by_id(commitment_ids[1]).unwrap();
    proof_builder.reveal_by_id(commitment_ids[3]).unwrap();

    let substrings_proof = proof_builder.build().unwrap();

    let true_proof = TlsProof {
        session: session_proof,
        substrings: substrings_proof,
    };

    let json_proof = serde_json::json!(true_proof);

    // let readable_proof = format(json_proof).unwrap();

    // let res = serde_json::json!({
    //   "proof": true_proof,
    //   "readable_proof": readable_proof
    // });

    let res = serde_json::json!(json_proof);

    println!("Closing the connection to the Etherscan API");
    let mut client_socket = connection_task.await.unwrap().unwrap().io.into_inner();
    client_socket.shutdown().await.unwrap();
    print!("Closed the connection to Etherscan API");

    HttpResponse::Ok()
        .content_type("application/json")
        .body(serde_json::to_string_pretty(&res).unwrap())
}

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
