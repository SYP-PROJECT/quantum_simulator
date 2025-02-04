# Stage 1: Build the Rust application
FROM rust:1.75 as builder

# Set the working directory
WORKDIR /app

# Copy Cargo.toml and Cargo.lock first to cache dependencies
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build && \
    rm -rf src

# Now copy the actual source code
COPY src src/

# Build the application with the actual source code
RUN cargo build --release

# Stage 2: Create a minimal runtime image
FROM debian:bookworm-slim

# Install necessary dependencies
RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/target/release/quantum_simulator .

# Expose the port your application listens on
EXPOSE 8000

# Run the application
CMD ["./quantum_simulator"]
