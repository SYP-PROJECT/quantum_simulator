use axum::{http::StatusCode, response::IntoResponse, Json};

use crate::{interpreter::interpret_program, models::ProgramNode};

pub async fn simulation_handler(
    Json(body): Json<ProgramNode>,
) -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    println!("{:?}", body);
    Ok((StatusCode::OK, Json(interpret_program(body))))
}

pub async fn up() -> Result<impl IntoResponse, (StatusCode, Json<serde_json::Value>)> {
    Ok((StatusCode::OK, Json("The server is up!")))
}
