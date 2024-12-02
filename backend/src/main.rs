use axum::http::{header::ACCEPT, header::CONTENT_TYPE, Method};
use route::create_router;
use tower_http::cors::{Any, CorsLayer};

mod gate;
mod handler;
mod models;
mod qubit;
mod route;

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::POST, Method::GET])
        .allow_headers([CONTENT_TYPE, ACCEPT]);

    let app = create_router().layer(cors);

    println!("Server started on localhost:8000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
