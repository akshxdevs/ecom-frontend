use crate::auth::generate_jwt;
use axum::{extract::State, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use store::Store;

#[derive(Deserialize)]
pub struct SignInInput {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct SignInOutput {
    pub token: String,
    pub user: SignInUserPayload,
}

#[derive(Serialize)]
pub struct SignInUserPayload {
    pub id: String,
    pub username: String,
    pub email: String,
    pub role: String,
}

pub async fn signin_route(
    State(store): State<Arc<Store>>,
    Json(data): Json<SignInInput>,
) -> impl IntoResponse {
    let password_hash = data.password.clone();

    match store.sign_in(data.email.clone(), password_hash).await {
        Ok(Some(user)) => {
            let secret =
                std::env::var("AUTH_JWT_SECRET").unwrap_or_else(|_| "akshxsect34".to_string());
            match generate_jwt(user.id.to_string(), &secret) {
                Ok(token) => {
                    let response = SignInOutput {
                        user: SignInUserPayload {
                            id: user.id.to_string(),
                            username: user.username.clone(),
                            email: user.email.clone(),
                            role: user.role.to_string(),
                        },
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
            "Invalid email or password".to_string(),
        )
            .into_response(),
        Err(e) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Signin error: {}", e),
        )
            .into_response(),
    }
}
