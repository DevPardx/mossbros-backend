#!/bin/bash

# MossBros Backend - Production Deployment Script
# This script handles deployment to Digital Ocean

set -e

# Change to backend directory (parent of scripts directory)
cd "$(dirname "$0")/.."

COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

echo "======================================"
echo "MossBros Backend - Deployment"
echo "======================================"
echo ""

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found!"
    echo ""
    echo "Please create $ENV_FILE file with your production configuration."
    echo "You can use .env.production.example as a template:"
    echo ""
    echo "  cp .env.example .env"
    echo "  nano .env  # Edit with your values"
    echo ""
    exit 1
fi

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Function to run database migrations
run_migrations() {
    echo "Running database migrations..."
    docker compose -f $COMPOSE_FILE exec -T backend npm run migration:run || {
        echo "Migrations failed or no new migrations to run"
    }
}

# Function to create database backup
backup_database() {
    echo "Creating database backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backups/postgres/backup_${TIMESTAMP}.sql"

    mkdir -p backups/postgres

    docker compose -f $COMPOSE_FILE exec -T postgres pg_dump \
        -U ${POSTGRES_USER:-postgres} \
        ${POSTGRES_DB:-mossbros} > $BACKUP_FILE || {
        echo "Database backup failed"
        return 1
    }

    echo "Backup created: $BACKUP_FILE"

    # Keep only last 7 backups
    ls -t backups/postgres/backup_*.sql | tail -n +8 | xargs -r rm
}

# Parse command line arguments
COMMAND=${1:-deploy}

case $COMMAND in
    deploy)
        echo "Starting deployment..."
        echo ""

        # Pull latest images
        echo "Pulling latest images..."
        docker compose -f $COMPOSE_FILE pull

        # Build the application
        echo "Building application..."
        docker compose -f $COMPOSE_FILE build --no-cache backend

        # Stop services gracefully
        if docker compose -f $COMPOSE_FILE ps | grep -q "Up"; then
            echo "Stopping current services..."

            # Create backup before stopping
            backup_database

            docker compose -f $COMPOSE_FILE down
        fi

        # Start services
        echo "Starting services..."
        docker compose -f $COMPOSE_FILE up -d

        # Wait for services to be healthy
        echo "Waiting for services to be ready..."
        sleep 10

        # Run migrations
        run_migrations

        # Show status
        echo ""
        echo "Service status:"
        docker compose -f $COMPOSE_FILE ps

        echo ""
        echo "======================================"
        echo "Deployment completed!"
        echo "======================================"
        echo ""
        echo "Your API is now running at: https://api.mossbrossv.com"
        echo ""
        echo "Useful commands:"
        echo "  ./scripts/deploy.sh logs      - View logs"
        echo "  ./scripts/deploy.sh status    - Check status"
        echo "  ./scripts/deploy.sh restart   - Restart services"
        echo "  ./scripts/deploy.sh backup    - Create database backup"
        echo ""
        ;;

    start)
        echo "Starting services..."
        docker compose -f $COMPOSE_FILE up -d
        docker compose -f $COMPOSE_FILE ps
        ;;

    stop)
        echo "Stopping services..."
        docker compose -f $COMPOSE_FILE down
        ;;

    restart)
        echo "Restarting services..."
        docker compose -f $COMPOSE_FILE restart
        docker compose -f $COMPOSE_FILE ps
        ;;

    logs)
        SERVICE=${2:-backend}
        echo "Viewing logs for $SERVICE..."
        docker compose -f $COMPOSE_FILE logs -f --tail=100 $SERVICE
        ;;

    status)
        echo "Service status:"
        docker compose -f $COMPOSE_FILE ps
        echo ""
        echo "Health checks:"
        docker compose -f $COMPOSE_FILE exec backend wget -qO- http://localhost:4000/health || echo "❌ Backend health check failed"
        ;;

    backup)
        backup_database
        ;;

    restore)
        if [ -z "$2" ]; then
            echo "Error: Please specify backup file"
            echo "Usage: ./scripts/deploy.sh restore <backup_file>"
            echo ""
            echo "Available backups:"
            ls -lh backups/postgres/backup_*.sql 2>/dev/null || echo "No backups found"
            exit 1
        fi

        BACKUP_FILE=$2
        if [ ! -f "$BACKUP_FILE" ]; then
            echo "Error: Backup file not found: $BACKUP_FILE"
            exit 1
        fi

        echo "WARNING: This will restore the database from backup!"
        echo "Backup file: $BACKUP_FILE"
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY != "yes" ]]; then
            echo "Restore cancelled"
            exit 0
        fi

        echo "Restoring database from backup..."
        cat $BACKUP_FILE | docker compose -f $COMPOSE_FILE exec -T postgres psql \
            -U ${POSTGRES_USER:-postgres} \
            ${POSTGRES_DB:-mossbros}

        echo "Database restored successfully"
        ;;

    migrate)
        run_migrations
        ;;

    seed)
        echo "Seeding database..."
        docker compose -f $COMPOSE_FILE exec backend npm run seed
        ;;

    shell)
        SERVICE=${2:-backend}
        echo "Opening shell in $SERVICE..."
        docker compose -f $COMPOSE_FILE exec $SERVICE sh
        ;;

    clean)
        echo "WARNING: This will remove all containers, volumes, and data!"
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY != "yes" ]]; then
            echo "Clean cancelled"
            exit 0
        fi

        echo "Cleaning up..."
        docker compose -f $COMPOSE_FILE down -v
        echo "Cleanup completed"
        ;;

    update)
        echo "Updating application..."

        # Pull latest code
        if [ -d .git ]; then
            echo "Pulling latest code..."
            git pull
        fi

        # Deploy with new code
        $0 deploy
        ;;

    *)
        echo "Usage: ./scripts/deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  deploy      - Full deployment (build, migrate, start)"
        echo "  start       - Start services"
        echo "  stop        - Stop services"
        echo "  restart     - Restart services"
        echo "  logs [svc]  - View logs (default: backend)"
        echo "  status      - Check service status"
        echo "  backup      - Create database backup"
        echo "  restore     - Restore database from backup"
        echo "  migrate     - Run database migrations"
        echo "  seed        - Seed database with initial data"
        echo "  shell [svc] - Open shell in container (default: backend)"
        echo "  clean       - Remove all containers and volumes"
        echo "  update      - Pull latest code and deploy"
        echo ""
        exit 1
        ;;
esac
