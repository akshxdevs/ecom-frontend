use crate::config::Config;
use crate::models::user::User;
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
    ) -> Result<User, sqlx::Error> {
        User::create(&self.pool, &username, &email, &password_hash).await
    }

    pub async fn sign_in(
        &self,
        username: String,
        password_hash: String,
    ) -> Result<Option<User>, sqlx::Error> {
        if let Some(user) = User::find_by_username(&self.pool, &username).await? {
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
