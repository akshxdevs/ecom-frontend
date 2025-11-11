use axum::{extract::State, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::auth::generate_jwt;
use store::Store;

#[derive(Deserialize)]
pub struct CreateUserInput {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct CreateUserOutput {
    pub id: String,
    pub token: String,
}

pub async fn signup_route(
    State(store): State<Arc<Store>>,
    Json(data): Json<CreateUserInput>,
) -> impl IntoResponse {
    // In a real app, hash the password here
    let password_hash = data.password; // TODO: Hash password
    
    match store.sign_up(data.username.clone(), data.email.clone(), password_hash).await {
        Ok(user) => {
            let secret = "your-secret-key"; // Move to env/config in real app
            match generate_jwt(user.id.to_string(), secret) {
                Ok(token) => {
                    let response = CreateUserOutput {
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
        Err(e) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Signup error: {}", e),
        )
            .into_response(),
    }
}
