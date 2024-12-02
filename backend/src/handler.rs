use axum::{http::StatusCode, response::IntoResponse, Json};

use crate::{interpreter::interpret_program, models::ProgramNode};

pub async fn simulation_handler(
    Json(body): Json<ProgramNode>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    let result = interpret_program(body);
    Ok(StatusCode::NO_CONTENT)
}
