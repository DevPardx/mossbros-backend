#!/bin/bash

# Mossbros Backend Deployment Script
# This script should be run on the droplet

set -e  # Exit on error

echo "Starting Mossbros Backend deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/mossbros/mossbros-backend"
BACKUP_DIR="/home/mossbros/backups"

# Function to print colored output
print_status() {
    echo -e "${GREEN}${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}${NC} $1"
}

print_error() {
    echo -e "${RED}${NC} $1"
}

# Check if running in the correct directory
if [ "$PWD" != "$PROJECT_DIR" ]; then
    print_error "Please run this script from $PROJECT_DIR"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please create it before deploying."
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup database (if postgres container is running)
if docker ps | grep -q mossbros_postgres; then
    print_status "Creating database backup..."
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    docker exec mossbros_postgres pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-mossbros}" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" || print_warning "Database backup failed"
    print_status "Database backup saved to $BACKUP_DIR/db_backup_$TIMESTAMP.sql"
fi

# Pull latest changes from git
print_status "Pulling latest changes from git..."
git pull origin main || {
    print_error "Git pull failed. Please resolve conflicts manually."
    exit 1
}

# Stop running containers
print_status "Stopping running containers..."
docker compose down

# Remove old images to save space
print_status "Removing old Docker images..."
docker image prune -f

# Build and start containers
print_status "Building and starting containers..."
docker compose up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check if all containers are running
if docker compose ps | grep -q "Exit"; then
    print_error "Some containers failed to start. Checking logs..."
    docker compose logs --tail=50
    exit 1
fi

# Note: Migrations run automatically on startup (migrationsRun: true in typeorm config)
print_status "Migrations will run automatically on backend startup..."

# Show container status
print_status "Container status:"
docker compose ps

# Show logs
print_status "Recent logs:"
docker compose logs --tail=20

echo ""
print_status "Deployment completed successfully!"
echo ""
echo "To view logs, run: docker compose logs -f"
echo "To check status, run: docker compose ps"
