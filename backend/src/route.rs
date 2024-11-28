use axum::{routing::post, Router};

use crate::handler::simulation_handler;

pub fn create_router() -> Router {
    Router::new().route("/api/", post(simulation_handler))
}
