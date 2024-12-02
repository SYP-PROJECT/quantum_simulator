use axum::http::{header::CONTENT_TYPE, HeaderValue, Method};
use route::create_router;
use tower_http::cors::CorsLayer;

mod gate;
mod handler;
mod interpreter;
mod models;
mod qubit;
mod route;

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
        .allow_methods([Method::POST])
        .allow_headers([CONTENT_TYPE]);

    let app = create_router().layer(cors);

    println!("Server started on localhost:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
