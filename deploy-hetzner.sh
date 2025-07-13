#!/bin/bash

# Hetzner deployment script for frizerke application
# This script should be run on your Hetzner server

set -e

echo "🚀 Starting Hetzner deployment for Frizerke application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please edit .env file with your actual configuration before running again."
    print_warning "Run 'node generate-session-secret.js' to generate a secure SESSION_SECRET"
    exit 1
fi

# Validate critical environment variables
print_status "Validating environment configuration..."
source .env

if [ "$SESSION_SECRET" = "CHANGE_THIS_TO_STRONG_RANDOM_STRING_MINIMUM_32_CHARS" ]; then
    print_error "Please change SESSION_SECRET from default value!"
    print_warning "Run 'node generate-session-secret.js' to generate a secure one"
    exit 1
fi

# Check other required variables
REQUIRED_VARS=("POSTGRES_PASSWORD" "EMAIL_USER" "EMAIL_PASS" "ADMIN_EMAIL")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set"
        exit 1
    fi
done

print_status "✅ Environment validation passed"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Remove old images (optional, uncomment if you want to always use latest)
# print_status "Removing old images..."
# docker image prune -f

# Build and start containers with production config
print_status "Building and starting containers with production configuration..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 10

# Check if containers are running
print_status "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Show logs
print_status "Showing recent logs..."
docker-compose -f docker-compose.prod.yml logs --tail=20

# Final status check
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    print_status "Application should be available at: http://your-server-ip:3000"
    print_status "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    print_status "To stop: docker-compose -f docker-compose.prod.yml down"
else
    print_error "❌ Deployment failed. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
