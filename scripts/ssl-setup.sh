#!/bin/bash

# MossBros Backend - SSL Certificate Setup Script
# This script sets up SSL certificates using Let's Encrypt

set -e

# Change to backend directory (parent of scripts directory)
cd "$(dirname "$0")/.."

DOMAIN="api.mossbrossv.com"
EMAIL="admin@mossbrossv.com"  # Change this to your email

# Use staging server for testing (to avoid rate limits)
# Set to "--staging" for testing, or "" for production
STAGING_FLAG="${1:-}"  # Pass --staging as first argument for testing

echo "======================================"
echo "SSL Certificate Setup"
echo "======================================"
echo ""
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Pre-flight checks
echo "Running pre-flight checks..."

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi
echo "Docker is running"

# Check if domain resolves to this server
echo "Checking DNS resolution for $DOMAIN..."
DOMAIN_IP=$(dig +short $DOMAIN | tail -1)
if [ -z "$DOMAIN_IP" ]; then
    echo "Warning: Domain $DOMAIN does not resolve to any IP"
    echo "Make sure your DNS is configured correctly before proceeding"
    read -p "Continue anyway? (yes/no): " -r
    if [[ $REPLY != "yes" ]]; then
        echo "Setup cancelled"
        exit 0
    fi
else
    echo "Domain resolves to: $DOMAIN_IP"
fi

echo ""

# Create required directories
echo "Creating required directories..."
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p nginx/conf.d

# Create temporary nginx config for initial certificate
echo "Creating temporary nginx configuration..."
cat > nginx/conf.d/temp.conf << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

# Start nginx temporarily for certificate generation
echo "Starting temporary nginx server..."
docker compose -f docker-compose.production.yml up -d nginx

# Wait for nginx to be ready
echo "Waiting for nginx to be ready..."
sleep 5

# Request certificate
echo "Requesting SSL certificate..."
# Check if certificate already exists
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo "Certificate already exists. Use --force-renewal to renew."
    RENEWAL_FLAG="--force-renewal"
else
    echo "Requesting new certificate..."
    RENEWAL_FLAG=""
fi

docker compose -f docker-compose.production.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    $STAGING_FLAG \
    $RENEWAL_FLAG \
    -d $DOMAIN

# Stop temporary nginx
echo "Stopping temporary nginx..."
docker compose -f docker-compose.production.yml down

# Remove temporary config
rm -f nginx/conf.d/temp.conf

echo ""
echo "======================================"
echo "SSL Certificate setup completed!"
echo "======================================"
echo ""
echo "Certificate location: ./certbot/conf/live/$DOMAIN/"
echo ""
if [ "$STAGING_FLAG" = "--staging" ]; then
    echo "NOTE: This is a STAGING certificate (not trusted by browsers)"
    echo "Run again without --staging flag for production certificate"
    echo ""
fi
echo "Next steps:"
echo "1. The backend.conf file is already configured to use this certificate"
echo "2. Run: ./scripts/deploy.sh to start the full application with SSL"
echo ""
echo "Usage:"
echo "./scripts/ssl-setup.sh           - Get production certificate"
echo "./scripts/ssl-setup.sh --staging - Get staging certificate (for testing)"
echo ""
