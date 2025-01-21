#FROM rust:latest
#WORKDIR /app
#COPY . .
#RUN cargo build --release
#ENTRYPOINT ["top", "-b"]


# Basis-Image mit Rust-Umgebung
FROM rust:latest AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Alle Dateien des Backend-Ordners in das Container-Image kopieren
COPY . .

# Abhängigkeiten cachen und Projekt bauen
RUN cargo build --release

# Produktions-Image
FROM debian:buster-slim

# Erforderliche Systembibliotheken installieren
RUN apt-get update && apt-get install -y \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis setzen
WORKDIR /app

# Binärdatei vom Builder kopieren
COPY --from=builder /app/target/release/quantum_simulator_backend .

# Standard-Port freigeben (falls zutreffend)
EXPOSE 8080

# Startbefehl für den Container
CMD ["./quantum_simulator_backend"]