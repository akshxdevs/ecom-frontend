use crate::auth::generate_jwt;
use axum::{extract::State, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use store::{models::user::UserRole, Store};

#[derive(Deserialize)]
pub struct CreateUserInput {
    pub username: String,
    pub email: String,
    pub password: String,
    pub role: Option<UserRole>,
}

#[derive(Serialize)]
pub struct CreateUserOutput {
    pub token: String,
    pub user: SignupUserPayload,
}

#[derive(Serialize)]
pub struct SignupUserPayload {
    pub id: String,
    pub username: String,
    pub email: String,
    pub role: String,
}

pub async fn signup_route(
    State(store): State<Arc<Store>>,
    Json(data): Json<CreateUserInput>,
) -> impl IntoResponse {
    let password_hash = data.password;
    let role = data.role.unwrap_or(UserRole::Customer);

    match store
        .sign_up(
            data.username.clone(),
            data.email.clone(),
            password_hash,
            role,
        )
        .await
    {
        Ok(user) => {
            let secret =
                std::env::var("AUTH_JWT_SECRET").unwrap_or_else(|_| "akshxsect34".to_string());
            match generate_jwt(user.id.to_string(), &secret) {
                Ok(token) => {
                    let response = CreateUserOutput {
                        user: SignupUserPayload {
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
        Err(e) => (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Signup error: {}", e),
        )
            .into_response(),
    }
}
