# Docker & CI/CD Setup Guide

This guide will walk you through setting up the complete Docker and CI/CD pipeline for your Next.js application.

## Prerequisites

- Docker and Docker Compose installed
- GitHub repository with GitHub Actions enabled
- Docker Hub account (for image registry)
- Server with Docker installed (for production deployment)

## Step 1: Local Development Setup

### 1.1 Environment Configuration

Create your environment file:

```bash
cp env.example .env
```

Edit `.env` with your specific configuration.

### 1.2 Development with Docker Compose

Start the development environment:

```bash
# Start all services
docker-compose up

# Start with additional tools (Prisma Studio)
docker-compose --profile tools up

# Run in background
docker-compose up -d
```

Access your application:

- **App**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (with `--profile tools`)

### 1.3 VS Code Dev Container

1. Install the "Dev Containers" extension in VS Code
2. Open the project in VS Code
3. Press `Ctrl+Shift+P` and select "Dev Containers: Reopen in Container"
4. The container will build and start automatically

## Step 2: Production Build Testing

### 2.1 Build Production Image

```bash
# Build the production image
docker build -t your-app:latest .

# Test the production build
docker run -p 3000:3000 your-app:latest
```

### 2.2 Test Health Check

```bash
# Check application health
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

## Step 3: GitHub Repository Setup

### 3.1 Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name          | Description                 | Example                          |
| -------------------- | --------------------------- | -------------------------------- |
| `DOCKERHUB_USERNAME` | Your Docker Hub username    | `yourusername`                   |
| `DOCKERHUB_TOKEN`    | Docker Hub access token     | `dckr_pat_...`                   |
| `DEPLOY_WEBHOOK_URL` | Webhook URL for deployment  | `http://your-server:8080/deploy` |
| `WEBHOOK_SECRET`     | Secret key for webhook auth | `your-secret-key`                |

### 3.2 Docker Hub Token Setup

1. Go to Docker Hub → Account Settings → Security
2. Create a new access token
3. Copy the token and add it to GitHub secrets

### 3.3 Repository Permissions

Ensure GitHub Actions has permission to:

- Read repository contents
- Write packages (for Docker images)

## Step 4: Production Server Setup

### 4.1 Server Requirements

- Docker installed
- Node.js (for webhook server)
- Port 8080 available (for webhook server)
- Port 3000 available (for application)

### 4.2 Install Deployment Scripts

Copy the deployment scripts to your server:

```bash
# Create scripts directory
mkdir -p /opt/deploy

# Copy deployment scripts
scp scripts/deploy.sh user@your-server:/opt/deploy/
scp scripts/webhook-server.js user@your-server:/opt/deploy/

# Make script executable (Linux)
chmod +x /opt/deploy/deploy.sh
```

### 4.3 Configure Environment Variables

Create environment file on server:

```bash
# /opt/deploy/.env
WEBHOOK_PORT=8080
WEBHOOK_SECRET=your-secret-key
DATABASE_URL=your-production-database-url
```

### 4.4 Start Webhook Server

```bash
# Install dependencies
cd /opt/deploy
npm install

# Start webhook server
node webhook-server.js
```

For production, use a process manager like PM2:

```bash
# Install PM2
npm install -g pm2

# Start webhook server with PM2
pm2 start webhook-server.js --name "deploy-webhook"

# Save PM2 configuration
pm2 save
pm2 startup
```

### 4.5 Test Webhook Server

```bash
# Test webhook endpoint
curl -X POST http://your-server:8080/deploy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-key" \
  -d '{
    "image": "your-registry/your-app",
    "tag": "test"
  }'
```

## Step 5: CI/CD Pipeline Testing

### 5.1 Push to Main Branch

The CI/CD pipeline will automatically:

1. **Run Tests**: Execute all tests with coverage requirements
2. **Security Scan**: Scan for vulnerabilities using Trivy
3. **Build Image**: Create multi-platform Docker image
4. **Push to Registry**: Upload to Docker Hub
5. **Deploy**: Trigger deployment webhook

### 5.2 Monitor Pipeline

Check the GitHub Actions tab in your repository to monitor:

- Test results and coverage
- Security scan results
- Build status
- Deployment status

### 5.3 Troubleshooting

Common issues and solutions:

#### Build Failures

```bash
# Check build logs
docker build --progress=plain -t your-app:test .

# Test specific build stage
docker build --target tester -t your-app:test .
```

#### Deployment Failures

```bash
# Check webhook server logs
pm2 logs deploy-webhook

# Test deployment manually
/opt/deploy/deploy.sh your-registry/your-app latest
```

#### Health Check Failures

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' container-name

# Check application logs
docker logs container-name
```

## Step 6: Monitoring and Maintenance

### 6.1 Health Monitoring

Set up monitoring for:

- Application health endpoint
- Container status
- Server resources
- Database connectivity

### 6.2 Log Management

```bash
# View application logs
docker logs -f your-app-container

# View webhook server logs
pm2 logs deploy-webhook

# Rotate logs
docker run --rm -v /var/lib/docker:/var/lib/docker alpine sh -c 'find /var/lib/docker/containers -name "*-json.log" -exec truncate -s 0 {} \;'
```

### 6.3 Backup Strategy

- Database backups
- Configuration backups
- Image registry backups

### 6.4 Security Updates

- Regular base image updates
- Dependency vulnerability scanning
- Access token rotation

## Step 7: Advanced Configuration

### 7.1 Custom Docker Registry

Update the workflow to use a custom registry:

```yaml
env:
  REGISTRY: your-registry.com
  IMAGE_NAME: your-org/your-app
```

### 7.2 Multiple Environments

Create separate workflows for staging and production:

```yaml
# .github/workflows/deploy-staging.yml
# .github/workflows/deploy-production.yml
```

### 7.3 Blue-Green Deployment

Implement blue-green deployment for zero-downtime updates:

```bash
# Example blue-green deployment script
./scripts/blue-green-deploy.sh your-registry/your-app latest
```

### 7.4 Monitoring Integration

Integrate with monitoring services:

- Prometheus metrics
- Grafana dashboards
- Alert notifications

## Troubleshooting Guide

### Common Issues

1. **Port Conflicts**

   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   ```

2. **Permission Issues**

   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /opt/deploy
   ```

3. **Docker Build Failures**

   ```bash
   # Clean Docker cache
   docker system prune -a
   ```

4. **Webhook Timeouts**
   ```bash
   # Increase timeout in webhook server
   # Check network connectivity
   ```

### Debug Commands

```bash
# Check container status
docker ps -a

# Inspect container
docker inspect container-name

# View build history
docker history image-name

# Check resource usage
docker stats

# View network configuration
docker network ls
docker network inspect network-name
```

## Best Practices

1. **Security**
   - Use non-root containers
   - Regular security scans
   - Secret management
   - Network segmentation

2. **Performance**
   - Multi-stage builds
   - Layer caching
   - Resource limits
   - Health checks

3. **Reliability**
   - Graceful shutdowns
   - Error handling
   - Retry mechanisms
   - Rollback procedures

4. **Monitoring**
   - Structured logging
   - Metrics collection
   - Alert notifications
   - Performance tracking

## Next Steps

1. **Set up monitoring** with Prometheus/Grafana
2. **Implement logging** with ELK stack
3. **Add security scanning** with Trivy
4. **Configure backups** for data persistence
5. **Set up alerts** for critical issues
6. **Document procedures** for team members
7. **Plan disaster recovery** procedures
8. **Implement feature flags** for safe deployments
