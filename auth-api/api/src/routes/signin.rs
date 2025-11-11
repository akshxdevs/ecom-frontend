use axum::{extract::State, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::auth::generate_jwt;
use store::Store;

#[derive(Deserialize)]
pub struct SignInInput {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct SignInOutput {
    pub id: String,
    pub token: String,
}

pub async fn signin_route(
    State(store): State<Arc<Store>>,
    Json(data): Json<SignInInput>,
) -> impl IntoResponse {
    let password_hash = data.password.clone(); // TODO: Hash password
    
    match store.sign_in(data.username.clone(), password_hash).await {
        Ok(Some(user)) => {
            let secret = "akshxsect34";
            match generate_jwt(user.id.to_string(), secret) {
                Ok(token) => {
                    let response = SignInOutput {
                        id: user.id.to_string(),
                        token,
                    };
                    Json(response).into_response()
                }
                Err(e) => (
                    axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Token generation error: {}", e),
                )
                .into_response(),
            }
        }
        Ok(None) => (
            axum::http::StatusCode::UNAUTHORIZED,
            "Invalid username or password".to_string(),
        )
        .into_response(),
        Err(e) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Signin error: {}", e),
        )
        .into_response(),
    }
}
