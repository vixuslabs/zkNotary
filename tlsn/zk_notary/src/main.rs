use actix_web::{web, App, HttpServer};
mod simple_prover;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/notarize_simple", web::get().to(simple_prover::notarize))
            .route("/placeholder", web::get().to(simple_prover::notarize))
    })
    .bind("127.0.0.1:3000")?
    .run()
    .await
}
