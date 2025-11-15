#!/bin/bash

# MossBros Backend - SSL Certificate Setup Script
# This script sets up SSL certificates using Let's Encrypt

set -e

DOMAIN="api.mossbrossv.com"
EMAIL="admin@mossbrossv.com"  # Change this to your email

echo "======================================"
echo "SSL Certificate Setup"
echo "======================================"
echo ""
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

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
docker compose -f docker-compose.production.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
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
echo "Next steps:"
echo "1. The backend.conf file is already configured to use this certificate"
echo "2. Run: ./deploy.sh to start the full application with SSL"
echo ""
