use crate::config::Config;
use crate::models::user::{User, UserRole};
use sqlx::{postgres::PgPoolOptions, PgPool};

pub struct Store {
    pub pool: PgPool,
}

impl Store {
    pub async fn new() -> Self {
        let config = Config::default();

        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&config.db_url)
            .await
            .expect("Failed to connect to database");

        Self { pool }
    }

    pub async fn sign_up(
        &self,
        username: String,
        email: String,
        password_hash: String,
        role: UserRole,
    ) -> Result<User, sqlx::Error> {
        User::create(&self.pool, &username, &email, &password_hash, role).await
    }

    pub async fn sign_in(
        &self,
        email: String,
        password_hash: String,
    ) -> Result<Option<User>, sqlx::Error> {
        if let Some(user) = User::find_by_email(&self.pool, &email).await? {
            if user.password_hash == password_hash {
                Ok(Some(user))
            } else {
                Ok(None)
            }
        } else {
            Ok(None)
        }
    }
}
