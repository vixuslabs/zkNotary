mod utils;

use wasm_bindgen::prelude::*;
use std::time::Duration;
use elliptic_curve::pkcs8::DecodePublicKey;
use tlsn_core::proof::{SessionProof, TlsProof, self};
use p256::PublicKey;
use pem::parse;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// A Rust function that you can use instead of println!
pub fn rust_println(message: &str) {
    log(message);
}

/// A simple verifier which reads a proof and prints the verified data to the console.
#[wasm_bindgen]
pub fn verify(proof_json: &str, notary_pubkey: &str) {
    // Deserialize the proof
    let proof: TlsProof = serde_json::from_str(proof_json).unwrap();

    let TlsProof {
        // The session proof establishes the identity of the server and the commitments
        // to the TLS transcript.
        session,
        // The substrings proof proves select portions of the transcript, while redacting
        // anything the Prover chose not to disclose.
        substrings,
    } = proof;

    // Verify the session proof against the Notary's public key
    match notary_pubkey_from_str(notary_pubkey) {
        Ok(public_key) => {
            session
            .verify_with_default_cert_verifier(public_key)
            .unwrap();
            },
        Err(e) => eprintln!("Error reading public key: {}", e),
    }
    

    let SessionProof {
        // The session header that was signed by the Notary is a succinct commitment to the TLS transcript.
        header,
        // This is the server name, checked against the certificate chain shared in the TLS handshake.
        server_name,
        ..
    } = session;

    // The time at which the session was recorded
    let time = chrono::DateTime::UNIX_EPOCH + Duration::from_secs(header.time());

    // Verify the substrings proof against the session header.
    //
    // This returns the redacted transcripts
    let (mut sent, mut recv) = substrings.verify(&header).unwrap();

    // Replace the bytes which the Prover chose not to disclose with 'X'
    sent.set_redacted(b'X');
    recv.set_redacted(b'X');

    rust_println("-------------------------------------------------------------------");
    let formatted_message = format!(
        "Successfully verified that the bytes below came from a session with {:?} at {}.",
        server_name, time
    );
    rust_println(&formatted_message);
    rust_println("Note that the bytes which the Prover chose not to disclose are shown as X.");
    rust_println("\n");
    rust_println("Bytes sent:");
    rust_println("\n");
    let formatted_message = format!("{}", String::from_utf8(sent.data().to_vec()).unwrap());
    rust_println(&formatted_message);
    rust_println("\n");
    rust_println("Bytes received:");
    rust_println("\n");
    let formatted_message = format!("{}", String::from_utf8(recv.data().to_vec()).unwrap());
    rust_println(&formatted_message);
    rust_println("-------------------------------------------------------------------");
}

/// Returns a Notary pubkey trusted by this Verifier
fn notary_pubkey_from_str(pem_str: &str) -> Result<PublicKey, Box<dyn std::error::Error>> {
    let pem = parse(pem_str)?;
    let public_key = PublicKey::from_public_key_der(&pem.contents)?;

    Ok(public_key)
}