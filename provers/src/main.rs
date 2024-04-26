use actix_web::{web, App, HttpServer};
mod discord_prover;
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
use tokio::net::TcpStream;
use tokio_rustls::TlsConnector;
use tracing::debug;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/notarize_simple", web::get().to(simple_prover::notarize))
            .route("/notarize_discord", web::get().to(discord_prover::notarize))
            .route("/notarize_twitter", web::get().to(twitter_prover::notarize))
            .route("/notarize_github", web::get().to(github_prover::notarize))
    })
    .bind(("127.0.0.1", 3000))?
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
