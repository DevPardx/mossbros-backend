#!/bin/bash

# MossBros Backend - Server Setup Script for Digital Ocean
# This script completes the setup for deployment
# Assumes: Docker, deploy user, and firewall are already configured

set -e

# Get the backend directory (parent of scripts directory)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Change to backend directory
cd "$SCRIPT_DIR"

echo "======================================"
echo "MossBros Backend - Server Setup"
echo "======================================"
echo ""

echo "Skipping Docker installation (already installed)"
echo "Skipping user creation (already configured)"
echo "Skipping firewall setup (already configured)"
echo ""

# Verify Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running"
    exit 1
fi

echo "✓ Docker is installed and running"
docker --version
docker compose version
echo ""

# Install additional required packages if not present
echo "Checking required packages..."
PACKAGES_TO_INSTALL=""

for package in curl git fail2ban unattended-upgrades; do
    if ! dpkg -l | grep -q "^ii  $package "; then
        PACKAGES_TO_INSTALL="$PACKAGES_TO_INSTALL $package"
    fi
done

if [ -n "$PACKAGES_TO_INSTALL" ]; then
    echo "Installing missing packages:$PACKAGES_TO_INSTALL"
    apt-get update
    apt-get install -y $PACKAGES_TO_INSTALL
else
    echo "All required packages are installed"
fi

# Configure fail2ban if not running
if ! systemctl is-active --quiet fail2ban; then
    echo "Starting fail2ban..."
    systemctl enable fail2ban
    systemctl start fail2ban
else
    echo "Fail2ban is running"
fi

# Configure automatic security updates
if [ ! -f /etc/apt/apt.conf.d/20auto-upgrades ]; then
    echo "Configuring automatic security updates..."
    dpkg-reconfigure -plow unattended-upgrades
else
    echo "Automatic updates configured"
fi


# Create swap file if not exists (recommended for small droplets)
echo ""
echo "Checking swap configuration..."
if [ ! -f /swapfile ]; then
    echo "Creating 2GB swap file..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Swap file created (2GB)"
else
    echo "Swap file already exists"
fi

# Optimize system settings for Node.js if not already done
echo ""
echo "Checking system optimizations..."
if ! grep -q "MossBros Backend optimizations" /etc/sysctl.conf; then
    echo "Applying system optimizations..."
    cat >> /etc/sysctl.conf << 'EOF'

# MossBros Backend optimizations
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048
fs.file-max = 65536
EOF
    sysctl -p
    echo "System optimizations applied"
else
    echo "System optimizations already applied"
fi

# Create application directories
echo ""
echo "Setting up application directories..."
mkdir -p "$SCRIPT_DIR/backups/postgres"
mkdir -p "$SCRIPT_DIR/backups/redis"
mkdir -p "$SCRIPT_DIR/logs"
mkdir -p "$SCRIPT_DIR/nginx/conf.d"
mkdir -p "$SCRIPT_DIR/certbot/conf"
mkdir -p "$SCRIPT_DIR/certbot/www"

echo "Directories created"

# Set permissions if deploy user exists
if id "deploy" &>/dev/null; then
    chown -R deploy:deploy "$SCRIPT_DIR"
    echo "Permissions set for deploy user"
fi

echo ""
echo "======================================"
echo "Server setup completed!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Create .env.production file:"
echo "   cp .env.production.example .env.production"
echo "   nano .env.production"
echo ""
echo "2. Setup SSL certificates:"
echo "   ./scripts/ssl-setup.sh"
echo ""
echo "3. Deploy the application:"
echo "   ./scripts/deploy.sh deploy"
echo ""
