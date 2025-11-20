use std::{net::SocketAddr, sync::Arc};

use api::routes::{signin_route, signup_route};
use axum::{routing::post, Router};
use store::Store;

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let store = Arc::new(Store::new().await);

    let app = Router::new()
        .route("/signup", post(signup_route))
        .route("/signin", post(signin_route))
        .with_state(store);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("server running on port {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
