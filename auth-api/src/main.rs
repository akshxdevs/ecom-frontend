use std::{net::SocketAddr, sync::Arc};

use axum::{Router, routing::post};
use api::routes::{signup_route,signin_route};
use store::Store;

#[tokio::main]
async fn main() ->Result<(),std::io::Error>{
    let store = Arc::new(Store::new().await);
    
    let app = Router::new()
    .route("/signup", post(signup_route))
    .route("/signin", post(signin_route))
    .with_state(store);

    let addr = SocketAddr::from(([0,0,0,0,],3000));
    println!("server running on port {}",addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener,app).await?;
    Ok(())
}