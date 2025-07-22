# Setlists Web App

A modern web application built with Next.js, TypeScript, and Tailwind CSS for managing setlists and music collections.

## Features

- **Modern Next.js 14+** with App Router
- **TypeScript** throughout the stack
- **Tailwind CSS** for styling
- **Prisma ORM** with SQLite database
- **Comprehensive testing** with Jest and Testing Library
- **ESLint** configuration for code quality
- **Production-ready** deployment setup

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker (for containerized development)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd airecipes

# Start with Docker
docker-compose up -d

# Set up database
docker exec -it airecipes-app npm run db:setup

# Seed database with sample data
docker exec -it airecipes-app npm run db:seed
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

### Available Scripts

Run these commands inside the Docker container:

```bash
# Start development server
docker-compose up -d

# Build for production
docker exec -it airecipes-app npm run build

# Start production server
docker exec -it airecipes-app npm run start

# Run linting
docker exec -it airecipes-app npm run lint

# Run tests
docker exec -it airecipes-app npm run test

# Run tests in watch mode
docker exec -it airecipes-app npm run test:watch

# Run tests with coverage
docker exec -it airecipes-app npm run test:coverage

# Set up database and run migrations
docker exec -it airecipes-app npm run db:setup

# Seed database with sample data
docker exec -it airecipes-app npm run db:seed

# Format all files with Prettier
docker exec -it airecipes-app npm run format

# Check formatting without changing files
docker exec -it airecipes-app npm run format:check

# Format all files and run linting
docker exec -it airecipes-app npm run format:fix
```

## Environment Configuration

Copy `env.example` to `.env.local` and configure:

```bash
# Database Configuration
DATABASE_URL="file:./dev.db"

# App Configuration
NEXT_PUBLIC_APP_NAME="Setlists"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_APP_ENVIRONMENT="development"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Authentication (if using)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

## CI/CD Configuration

This project includes a GitHub Actions workflow for automated testing, building, and deployment.

**Note:** Automated deployments rely on a custom deploy script on your production server that can trigger the new image to be pulled and container restarted. This script is not included in this repository and must be set up separately on your server.

Configure the following secrets and variables in your GitHub repository:

### Required Configuration

| Type         | Name              | Description                        | Example                                  |
| ------------ | ----------------- | ---------------------------------- | ---------------------------------------- |
| **Secret**   | `DOCKERHUB_TOKEN` | Docker Hub access token            | `dckr_pat_...`                           |
| **Secret**   | `SSH_PRIVATE_KEY` | SSH private key for server access  | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| **Variable** | `SERVER_USER`     | SSH username for production server | `ubuntu`                                 |
| **Variable** | `SERVER_HOST`     | Production server IP/hostname      | `192.168.1.100`                          |
| **Variable** | `ENV_PATH`        | Path to production .env file       | `/srv/deploy/docker/apps/.appname.env`   |

**Note:** All secrets and variables should be configured as **Repository Secrets/Variables** (not Environment Secrets).

### Production Environment File

Your production server must have a complete `.env` file with all necessary environment variables. This file should be a fully configured version of `env.example` with your production values. The CI/CD workflow will fetch this file during the build process to access all required environment variables.

### Setup Instructions

1. **GitHub Variables** (Settings → Secrets and variables → Actions → Variables):
   - Add `SERVER_USER` with your server SSH username
   - Add `SERVER_HOST` with your server IP/hostname
   - Add `ENV_PATH` with the path to your production `.env` file

2. **GitHub Secrets** (Settings → Secrets and variables → Actions → Secrets):
   - Add `DOCKERHUB_TOKEN` with your Docker Hub access token
   - Add `SSH_PRIVATE_KEY` with your entire SSH private key content

3. **Production Server Setup**:
   - Ensure your production `.env` file contains `DOCKERHUB_USER` and `APP_NAME` variables
   - The path to your `.env` file is configured via the `ENV_PATH` GitHub variable

### Workflow Features

- **Testing**: Runs Jest tests with coverage
- **Security**: Trivy vulnerability scanning
- **Building**: Multi-platform Docker image (AMD64 + ARM64)
- **Deployment**: Blue/green deployment via custom server script (`dc deploy`)
- **Triggers**: Runs on pushes to `main`/`develop` and pull requests

### Deployment Process

The workflow builds a Docker image and pushes it to Docker Hub as `your-username/nextjstemplate:latest`. On successful build, it triggers a blue/green deployment on your production server using the custom `dc deploy appname` script.

**Deployment Flow:**

1. Build and test application
2. Build multi-platform Docker image
3. Push to Docker Hub (`your-username/nextjstemplate:latest`)
4. SSH to production server
5. Execute `dc deploy appname` (blue/green deployment)

## Database

This project uses Prisma ORM with SQLite for simplicity. The database schema is defined in `prisma/schema.prisma`.

### Database Commands

```bash
# Set up database
docker exec -it airecipes-app npm run db:setup

# Generate Prisma client
docker exec -it airecipes-app npx prisma generate

# Run migrations
docker exec -it airecipes-app npx prisma migrate dev

# Open Prisma Studio
docker exec -it airecipes-app npx prisma studio

# Reset database
docker exec -it airecipes-app npx prisma migrate reset
```

## Testing

### Run Tests

```bash
# Run all tests
docker exec -it airecipes-app npm run test

# Run tests in watch mode
docker exec -it airecipes-app npm run test:watch

# Run tests with coverage
docker exec -it airecipes-app npm run test:coverage
```

### Test Structure

- **Unit tests**: Test individual components and functions
- **Integration tests**: Test API routes and database operations
- **E2E tests**: Test complete user workflows

## API Routes

The app includes API routes in the `src/app/api/` directory:

```http
GET  /api/health                    # Health check
GET  /api/setlists                  # Get all setlists
POST /api/setlists                  # Create new setlist
PUT  /api/setlists/:id              # Update setlist
DELETE /api/setlists/:id            # Delete setlist
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
