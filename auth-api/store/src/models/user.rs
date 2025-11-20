use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, PgPool, Type};
use std::fmt;
use uuid::Uuid;

#[derive(Debug, FromRow, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub role: UserRole,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize, Type, Clone, Copy)]
#[sqlx(type_name = "user_role", rename_all = "PascalCase")]
pub enum UserRole {
    Customer,
    Seller,
    Delivery,
}

impl fmt::Display for UserRole {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let role_str = match self {
            UserRole::Customer => "customer",
            UserRole::Seller => "seller",
            UserRole::Delivery => "delivery",
        };
        write!(f, "{}", role_str)
    }
}

impl User {
    pub async fn create(
        pool: &PgPool,
        username: &str,
        email: &str,
        password_hash: &str,
        role: UserRole,
    ) -> Result<Self, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, password_hash, role, created_at
            "#,
        )
        .bind(username)
        .bind(email)
        .bind(password_hash)
        .bind(&role)
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_email(pool: &PgPool, email: &str) -> Result<Option<Self>, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT id, username, email, password_hash, role, created_at
            FROM users
            WHERE email = $1
            "#,
        )
        .bind(email)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_username(
        pool: &PgPool,
        username: &str,
    ) -> Result<Option<Self>, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT id, username, email, password_hash, role, created_at
            FROM users
            WHERE username = $1
            "#,
        )
        .bind(username)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    pub async fn verify_login(
        pool: &PgPool,
        username: &str,
        password_hash: &str,
    ) -> Result<bool, sqlx::Error> {
        if let Some(user) = Self::find_by_username(pool, username).await? {
            Ok(user.password_hash == password_hash)
        } else {
            Ok(false)
        }
    }
}
