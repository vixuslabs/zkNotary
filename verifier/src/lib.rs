mod utils;

use elliptic_curve::pkcs8::DecodePublicKey;
use p256::PublicKey;
use pem::parse;
use std::time::Duration;
use tlsn_core::proof::{SessionProof, TlsProof};
use wasm_bindgen::prelude::*;

/// A simple verifier which reads a proof and returns the verified session transcript.
#[wasm_bindgen]
pub fn verify(proof_json: &str, notary_pubkey: &str) -> Result<String, JsValue> {
    // Deserialize the proof
    let proof: TlsProof = serde_json::from_str(proof_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize proof: {}", e)))?;

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
                .map_err(|e| JsValue::from_str(&format!("Verification failed: {}", e)))?;
        }
        Err(e) => {
            return Err(JsValue::from_str(&format!(
                "Error reading public key: {}",
                e
            )))
        }
    }

    let SessionProof {
        // The session header that was signed by the Notary is a succinct commitment to the TLS transcript.
        header,
        // This is the server name, checked against the certificate chain shared in the TLS handshake.
        session_info,
        signature,
    } = session;

    // The time at which the session was recorded
    let time = chrono::DateTime::UNIX_EPOCH + Duration::from_secs(header.time());

    // Verify the substrings proof against the session header.
    //
    // This returns the redacted transcripts
    let (mut sent, mut recv) = substrings
        .verify(&header)
        .map_err(|e| JsValue::from_str(&format!("Verification of substrings failed: {}", e)))?;

    // Replace the bytes which the Prover chose not to disclose with 'X'
    sent.set_redacted(b'X');
    recv.set_redacted(b'X');

    let mut output = String::new();
    let formatted_message = format!(
        "Successfully verified that the bytes below came from a session with {:?} at {}.\n",
        server_name, time
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

/// Returns a Notary pubkey trusted by this Verifier
fn notary_pubkey_from_str(pem_str: &str) -> Result<PublicKey, Box<dyn std::error::Error>> {
    let pem = parse(pem_str)?;
    let public_key = PublicKey::from_public_key_der(&pem.contents)?;

    Ok(public_key)
}
