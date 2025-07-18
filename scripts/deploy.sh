#!/bin/bash

# Deployment script for Next.js application.
# This script is designed to be triggered by CI/CD pipeline.

set -e

IMAGE_NAME=${1:-"your-registry/your-app"}
TAG=${2:-"latest"}
CONTAINER_NAME="your-app-container"
PORT=${3:-3000}

echo "Starting deployment..."
echo "Image: $IMAGE_NAME:$TAG"
echo "Container: $CONTAINER_NAME"
echo "Port: $PORT"

echo "Pulling latest image..."
docker pull "$IMAGE_NAME:$TAG"

if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    echo "Stopping existing container..."
    docker stop "$CONTAINER_NAME"
fi

if docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
    echo "Removing existing container..."
    docker rm "$CONTAINER_NAME"
fi

echo "Starting new container..."
docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$PORT:3000" \
    --restart unless-stopped \
    -e NODE_ENV=production \
    -e DATABASE_URL="$DATABASE_URL" \
    "$IMAGE_NAME:$TAG"

echo "Waiting for container to be healthy..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null | grep -q "healthy"; then
        echo "Container is healthy!"
        break
    fi
    
    if ! docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        echo "Container failed to start!"
        docker logs "$CONTAINER_NAME"
        exit 1
    fi
    
    echo "Waiting for health check... ($counter/$timeout)"
    sleep 5
    counter=$((counter + 5))
done

if [ $counter -ge $timeout ]; then
    echo "Health check timeout!"
    docker logs "$CONTAINER_NAME"
    exit 1
fi

echo "Verifying application..."
if curl -f http://localhost:"$PORT"/api/health > /dev/null 2>&1; then
    echo "Application is responding successfully!"
else
    echo "Application is not responding!"
    docker logs "$CONTAINER_NAME"
    exit 1
fi

echo "Deployment completed successfully!"
echo "Application is available at http://localhost:$PORT"

echo "Cleaning up old images..."
docker images "$IMAGE_NAME" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | tail -n +2 | sort -k2 -r | tail -n +4 | awk '{print $1}' | xargs -r docker rmi

echo "Deployment script completed!" 