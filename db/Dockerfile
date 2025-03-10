# Use the official PostgreSQL image from the Docker Hub
FROM postgres:latest

# Create a directory for persistent data
RUN mkdir -p /var/lib/postgresql/data/pgdata

# Set the data directory to the persistent storage location
ENV PGDATA=/var/lib/postgresql/data/pgdata

# Expose the PostgreSQL port
EXPOSE 5432

# Start PostgreSQL
CMD ["postgres"]
