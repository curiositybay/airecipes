# Docker Setup for Next.js Application

This document describes the Docker setup for the Next.js application, including development, testing, and production deployment.

## Overview

The application uses a multi-stage Docker build process with separate configurations for development and production environments.

## File Structure

```
├── Dockerfile          # Production multi-stage build
├── Dockerfile.dev      # Development build
├── docker-compose.yml  # Development environment
├── .dockerignore       # Build context optimization
├── scripts/deploy.sh   # Deployment script
├── scripts/webhook-server.js # Webhook server
└── .devcontainer/      # VS Code Dev Container config
```

## Development Environment

### Using Docker Compose

1. **Start the development environment:**

   ```bash
   docker-compose up
   ```

2. **Start with additional tools (Prisma Studio):**

   ```bash
   docker-compose --profile tools up
   ```

3. **Stop the environment:**
   ```bash
   docker-compose down
   ```

### Using VS Code Dev Container

1. Install the "Dev Containers" extension in VS Code
2. Open the project in VS Code
3. Press `Ctrl+Shift+P` and select "Dev Containers: Reopen in Container"
4. The container will build and start automatically

### Development Features

- **Hot Reloading**: Code changes are reflected immediately
- **Volume Mounting**: Source code is mounted for live editing
- **Health Checks**: Automatic health monitoring for app and database
- **Database**: SQLite database with persistent storage
- **Prisma Studio**: Available on port 5555 (with `--profile tools`)

## Production Build

### Building the Production Image

```bash
# Build the production image
docker build -t your-app:latest .

# Build with specific tag
docker build -t your-app:v1.0.0 .
```

### Running the Production Container

```bash
# Run the production container
docker run -p 3000:3000 your-app:latest

# Run with environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NODE_ENV=production \
  your-app:latest
```

## Multi-Stage Build Process

The production Dockerfile uses a 4-stage build process:

1. **Dependencies Stage**: Install production dependencies
2. **Builder Stage**: Build the Next.js application
3. **Tester Stage**: Run tests with coverage
4. **Runner Stage**: Create optimized production image

### Build Stages

```bash
# Build specific stage
docker build --target deps -t your-app:deps .
docker build --target builder -t your-app:builder .
docker build --target tester -t your-app:tester .
docker build --target runner -t your-app:runner .
```

## CI/CD Pipeline

The GitHub Actions workflow (`/.github/workflows/ci-cd.yml`) includes:

1. **Testing**: Run tests with coverage requirements
2. **Security Scanning**: Trivy vulnerability scanner
3. **Building**: Multi-platform Docker image build
4. **Pushing**: Push to Docker Hub
5. **Deployment**: Trigger production deployment

### Required Secrets

Configure these secrets in your GitHub repository:

- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token
- `DEPLOY_WEBHOOK_URL`: Webhook URL for deployment triggers

## Environment Variables

### Development

Create a `.env` file based on `env.example`:

```bash
cp env.example .env
```

### Production

Set these environment variables in your production environment:

```bash
NODE_ENV=production
DATABASE_URL=your-production-database-url
PORT=3000
```

## Health Checks

The application includes comprehensive health checks for both development and production environments:

### Application Health Check

Endpoint: `/api/health`

Returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

### Docker Health Check Configuration

**Production (Dockerfile):**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

**Development (docker-compose.yml):**

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Database Health Check

The SQLite database also includes health checks:

```yaml
healthcheck:
  test: ['CMD', 'sqlite3', '/var/lib/sqlite/dev.db', 'SELECT 1']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

## Security Features

- **Non-root user**: Application runs as `nextjs` user (UID 1001)
- **Minimal base image**: Uses Alpine Linux for smaller attack surface
- **Security scanning**: Trivy vulnerability scanner in CI/CD
- **Security headers**: Configured in `next.config.ts`

## Performance Optimizations

- **Multi-stage builds**: Reduces final image size
- **Layer caching**: Optimized for faster rebuilds
- **Standalone output**: Next.js standalone mode for minimal runtime
- **Alpine Linux**: Lightweight base image

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 5555 are available
2. **Permission issues**: Check file permissions in mounted volumes
3. **Database connection**: Verify DATABASE_URL environment variable
4. **Build failures**: Check for missing dependencies in package.json

### Debug Commands

```bash
# Check container logs
docker-compose logs app

# Access container shell
docker-compose exec app sh

# Check container health
docker inspect --format='{{.State.Health.Status}}' container-name

# View build stages
docker build --target builder . --progress=plain
```

## Deployment

### Manual Deployment

```bash
# Build and push to registry
docker build -t your-registry/your-app:latest .
docker push your-registry/your-app:latest

# Deploy to server
docker pull your-registry/your-app:latest
docker stop your-app-container
docker rm your-app-container
docker run -d --name your-app-container -p 3000:3000 your-registry/your-app:latest
```

### Automated Deployment

The CI/CD pipeline automatically:

1. Builds the Docker image on push to main
2. Pushes to Docker Hub with appropriate tags
3. Triggers deployment via webhook

## Monitoring

### Health Check

```bash
# Check application health
curl http://localhost:3000/api/health
```

### Logs

```bash
# View application logs
docker logs your-app-container

# Follow logs in real-time
docker logs -f your-app-container
```

## Best Practices

1. **Always use specific image tags** in production
2. **Scan images for vulnerabilities** before deployment
3. **Monitor resource usage** and set appropriate limits
4. **Use secrets management** for sensitive data
5. **Implement proper logging** and monitoring
6. **Regular security updates** of base images
7. **Backup strategies** for persistent data
8. **Rollback procedures** for failed deployments
