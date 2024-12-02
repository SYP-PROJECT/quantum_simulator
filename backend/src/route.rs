use axum::{routing::get, routing::post, Router};

use crate::handler::{simulation_handler, up};

pub fn create_router() -> Router {
    Router::new()
        .route("/api/", post(simulation_handler))
        .route("/api/", get(up))
}
