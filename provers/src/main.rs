use actix_web::{web, App, HttpServer};
mod discord_prover;
mod etherscan_prover;
mod github_prover;
mod simple_prover;
mod twitter_prover;

use http_body_util::{BodyExt as _, Either, Full};
use hyper::client::conn::http1::Parts;
use hyper::{body::Bytes, Request, StatusCode};
use hyper_util::rt::TokioIo;
use notary_server::{ClientType, NotarizationSessionRequest, NotarizationSessionResponse};
use rustls::{Certificate, ClientConfig, RootCertStore};
use std::sync::Arc;
use std::time::Duration;
use tlsn_core::proof::{SessionProof, TlsProof};
use tokio::net::TcpStream;
use tokio_rustls::TlsConnector;
use tracing::debug;

use std::fmt;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/notarize_simple", web::get().to(simple_prover::notarize))
            .route("/notarize_discord", web::get().to(discord_prover::notarize))
            .route("/notarize_twitter", web::get().to(twitter_prover::notarize))
            .route("/notarize_github", web::get().to(github_prover::notarize))
            .route(
                "/notarize_etherscan",
                web::get().to(etherscan_prover::notarize),
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

pub async fn setup_notary_connection(
    notary_host: &str,
    notary_port: u16,
    max_transcript_size: Option<usize>,
) -> (tokio_rustls::client::TlsStream<TcpStream>, String) {
    let pem_file = std::str::from_utf8(include_bytes!("./rootCA.crt")).unwrap();

    // Connect to the Notary via TLS-TCP
    // let mut certificate_file_reader = read_pem_file(NOTARY_CA_CERT_PATH).await.unwrap();
    let mut certificate_file_reader = std::io::BufReader::new(pem_file.as_bytes());
    let mut certificates: Vec<Certificate> = rustls_pemfile::certs(&mut certificate_file_reader)
        .unwrap()
        .into_iter()
        .map(Certificate)
        .collect();
    let certificate = certificates.remove(0);

    let mut root_store = RootCertStore::empty();
    root_store.add(&certificate).unwrap();

    let client_notary_config = ClientConfig::builder()
        .with_safe_defaults()
        .with_root_certificates(root_store)
        .with_no_client_auth();
    let notary_connector = TlsConnector::from(Arc::new(client_notary_config));

    let notary_socket = tokio::net::TcpStream::connect((notary_host, notary_port))
        .await
        .unwrap();

    let notary_tls_socket = notary_connector
        // Require the domain name of notary server to be the same as that in the server cert
        .connect("tlsnotaryserver.io".try_into().unwrap(), notary_socket)
        .await
        .unwrap();

    // Attach the hyper HTTP client to the notary TLS connection to send request to the /session endpoint to configure notarization and obtain session id
    let (mut request_sender, connection) =
        hyper::client::conn::http1::handshake(TokioIo::new(notary_tls_socket))
            .await
            .unwrap();

    // Spawn the HTTP task to be run concurrently
    let connection_task = tokio::spawn(connection.without_shutdown());

    // Build the HTTP request to configure notarization
    let payload = serde_json::to_string(&NotarizationSessionRequest {
        client_type: ClientType::Tcp,
        max_transcript_size,
    })
    .unwrap();

    let request = Request::builder()
        .uri(format!("https://{notary_host}:{notary_port}/session"))
        .method("POST")
        .header("Host", notary_port)
        // Need to specify application/json for axum to parse it as json
        .header("Content-Type", "application/json")
        .body(Either::Left(Full::new(Bytes::from(payload))))
        .unwrap();

    debug!("Sending configuration request");

    let configuration_response = request_sender.send_request(request).await.unwrap();

    debug!("Sent configuration request");

    assert!(configuration_response.status() == StatusCode::OK);

    debug!("Response OK");

    // Pretty printing :)
    let payload = configuration_response
        .into_body()
        .collect()
        .await
        .unwrap()
        .to_bytes();
    let notarization_response =
        serde_json::from_str::<NotarizationSessionResponse>(&String::from_utf8_lossy(&payload))
            .unwrap();

    debug!("Notarization response: {:?}", notarization_response,);

    // Send notarization request via HTTP, where the underlying TCP connection will be extracted later
    let request = Request::builder()
        // Need to specify the session_id so that notary server knows the right configuration to use
        // as the configuration is set in the previous HTTP call
        .uri(format!(
            "https://{}:{}/notarize?sessionId={}",
            notary_host,
            notary_port,
            notarization_response.session_id.clone()
        ))
        .method("GET")
        .header("Host", notary_host)
        .header("Connection", "Upgrade")
        // Need to specify this upgrade header for server to extract tcp connection later
        .header("Upgrade", "TCP")
        .body(Either::Right(Full::new(Bytes::from(payload))))
        .unwrap();

    debug!("Sending notarization request");

    let response = request_sender.send_request(request).await.unwrap();

    debug!("Sent notarization request");

    assert!(response.status() == StatusCode::SWITCHING_PROTOCOLS);

    debug!("Switched protocol OK");

    // Claim back the TLS socket after HTTP exchange is done
    let Parts {
        io: notary_tls_socket,
        ..
    } = connection_task.await.unwrap().unwrap();

    (
        notary_tls_socket.into_inner(),
        notarization_response.session_id,
    )
}

#[derive(Debug)]
pub enum FormatError {
    VerificationError(String),
    ParseError(String),
}

impl fmt::Display for FormatError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            FormatError::VerificationError(ref desc) => write!(f, "Verification error: {}", desc),
            FormatError::ParseError(ref err) => write!(f, "UTF-8 error: {}", err),
        }
    }
}

pub fn format(proof_json: serde_json::Value) -> Result<String, FormatError> {
    let proof: TlsProof = serde_json::from_value(proof_json).map_err(|e| -> FormatError {
        FormatError::ParseError(format!("Failed to deserialize proof: {}", e))
    })?;

    let TlsProof {
        // The session proof establishes the identity of the server and the commitments
        // to the TLS transcript.
        session,
        // The substrings proof proves select portions of the transcript, while redacting
        // anything the Prover chose not to disclose.
        substrings,
    } = proof;

    let SessionProof {
        // The session header that was signed by the Notary is a succinct commitment to the TLS transcript.
        header,
        // This is the server name, checked against the certificate chain shared in the TLS handshake.
        session_info,
        signature: _,
    } = session;

    // The time at which the session was recorded
    let time = chrono::DateTime::UNIX_EPOCH + Duration::from_secs(header.time());

    // Verify the substrings proof against the session header.
    //
    // This returns the redacted transcripts
    let (mut sent, mut recv) = substrings.verify(&header).map_err(|e| {
        FormatError::VerificationError(format!("Verification of substrings failed: {}", e))
    })?;

    // Replace the bytes which the Prover chose not to disclose with 'X'
    sent.set_redacted(b'X');
    recv.set_redacted(b'X');

    let mut output = String::new();
    let formatted_message = format!(
        "Successfully verified that the bytes below came from a session with {:?} at {}.\n",
        session_info.server_name, time
    );
    output.push_str(&formatted_message);
    output
        .push_str("Note that the bytes which the Prover chose not to disclose are shown as X.\n\n");
    output.push_str("Bytes sent:\n\n");
    let formatted_message = format!("{}", String::from_utf8(sent.data().to_vec()).unwrap());
    output.push_str(&formatted_message);
    output.push_str("\n\n");
    output.push_str("Bytes received:\n\n");
    let formatted_message = format!("{}", String::from_utf8(recv.data().to_vec()).unwrap());
    output.push_str(&formatted_message);

    Ok(output)
}
