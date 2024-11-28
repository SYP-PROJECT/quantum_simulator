use axum::{http::StatusCode, response::IntoResponse, Json};

use crate::models::ProgramNode;

pub async fn simulation_handler(
    Json(body): Json<ProgramNode>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    println!("{:?}", body);
    Ok(StatusCode::NO_CONTENT)
}
