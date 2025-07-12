#!/bin/bash
# Hetzner server setup script

echo "🚀 Setting up Hetzner server for Frizerke application..."

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl git wget software-properties-common

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
docker-compose --version

echo "✅ Docker setup complete!"

# Clone the repository
cd /opt
git clone https://github.com/nacka301/frizer_termin2.git
cd frizer_termin2
git checkout working-version

echo "✅ Repository cloned!"

# Setup environment
cp .env.example .env

echo "⚠️  Please edit .env file with your configuration:"
echo "nano .env"
echo ""
echo "After editing .env, run:"
echo "chmod +x deploy-hetzner.sh"
echo "./deploy-hetzner.sh"
