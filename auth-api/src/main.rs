use std::{net::SocketAddr};

use axum::{Router, routing::post};
use api::{signin_route,signup_route};

#[tokio::main]
async fn main() ->Result<(),std::io::Error>{
    let app = Router::new()
    .route("/signup", post(signup_route))
    .route("/signin", post(signin_route))
    .with_state(store);

    let addr = SocketAddr::from(([0,0,0,0,],3000));
    print!("server running on port {}",addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener,app).await?;
    Ok(())
}