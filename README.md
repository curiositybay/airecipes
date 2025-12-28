# AI Recipes

A portfolio demonstration project showcasing modern web development practices including **CI/CD automation**, **AI integration**, and **comprehensive test coverage**. This application generates personalized recipes using OpenAI's GPT models based on available ingredients.

> **Portfolio Focus**: This project demonstrates expertise in automated deployment pipelines, AI service integration, and maintaining 100% test coverage in a production-ready application.

## Portfolio Highlights

### 🚀 **CI/CD & DevOps Excellence**
- **Automated GitHub Actions Pipeline** with testing, security scanning, and deployment
- **Multi-stage Docker builds** with production optimizations
- **Blue/green deployment strategy** for zero-downtime updates
- **Trivy vulnerability scanning** integrated into CI pipeline
- **Environment-specific configurations** with proper secret management

### 🤖 **AI Integration & Modern Tech Stack**
- **OpenAI GPT Integration** for intelligent recipe generation
- **Modern Next.js 15+** with App Router and TypeScript
- **Redis Caching** for performance optimization
- **PostgreSQL with Prisma ORM** for scalable data management
- **Tailwind CSS** for responsive, modern UI design

### ✅ **Testing & Code Quality**
- **100% Test Coverage** across all metrics (statements, branches, functions, lines)
- **Comprehensive Test Suite** with Jest and Testing Library
- **Sophisticated Mock Architecture** for test isolation and reliability
- **ESLint & Prettier** for consistent code quality
- **TypeScript** for type safety throughout the application

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker (for containerized development)

### Setup

```bash
# Clone the repository
git clone https://github.com/curiositybay/airecipes.git
cd airecipes

# Copy environment file
cp env.example .env

# Configure your OpenAI API key in .env
# OPENAI_API_KEY=your-openai-api-key-here

# Start with Docker
docker-compose up -d

# Set up database
docker exec -it airecipes-app npm run db:setup

# Seed database with sample data
docker exec -it airecipes-app npm run db:seed
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

## Technical Implementation

### **AI Recipe Generation Flow**
1. **Input Ingredients**: Users enter the ingredients they have available
2. **AI Processing**: The application sends the ingredient list to OpenAI's GPT model
3. **Recipe Generation**: AI generates personalized recipes with:
   - Detailed cooking instructions
   - Nutritional information
   - Cooking time estimates
   - Difficulty levels
4. **Smart Fallbacks**: If AI service is unavailable, the app provides basic recipe suggestions
5. **User Preferences**: Support for dietary restrictions, cuisine preferences, and cooking skill levels

### **Development Practices Demonstrated**
- **Environment Variable Validation**: Strict validation prevents runtime errors
- **Error Handling**: Comprehensive error boundaries and fallback mechanisms
- **Caching Strategy**: Redis integration for performance optimization
- **Database Design**: Prisma ORM with proper schema design and migrations
- **API Design**: RESTful endpoints with proper validation and error responses
- **Security**: Non-root Docker containers, security headers, and proper secret management

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

Copy `env.example` to `.env` and configure:

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="AI Recipes"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_APP_ENVIRONMENT="development"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"

# OpenAI Configuration (Required)
OPENAI_API_KEY="your-openai-api-key-here"
OPENAI_MODEL="gpt-4o-mini"

# Database Configuration
DATABASE_URL="postgresql://postgres:postgres_password@postgres:5432/airecipes"

# Redis Configuration
REDIS_URL="redis://redis-dev:6379"
```

## CI/CD Pipeline & Testing Excellence

This project demonstrates professional-grade CI/CD practices with automated testing, building, and deployment.

### **GitHub Actions Workflow**
- **Multi-job Pipeline**: Separate jobs for testing, security scanning, building, and deployment
- **Parallel Execution**: Tests and security scans run concurrently for efficiency
- **Conditional Deployment**: Only deploys on successful main branch pushes
- **Caching Strategy**: Jest cache and Docker layer caching for faster builds

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

This project uses Prisma ORM with PostgreSQL for production scalability. The database schema is defined in `prisma/schema.prisma` and includes models for AI-generated recipes, ingredients, and user preferences.

### Database Commands

```bash
# Set up database
docker exec -it airecipes-app npm run db:setup

# Generate Prisma client
docker exec -it airecipes-app npx prisma generate

# Run migrations (production)
docker exec -it airecipes-app npx prisma migrate deploy

# Run migrations (development only)
docker exec -it airecipes-app npx prisma migrate dev

# Open Prisma Studio
docker exec -it airecipes-app npx prisma studio

# Reset database
docker exec -it airecipes-app npx prisma migrate reset
```

## Testing Excellence

### **100% Test Coverage Achievement**
This project maintains **100% test coverage** across all metrics:
- **1,908 statements** - 100% covered
- **838 branches** - 100% covered
- **301 functions** - 100% covered
- **1,773 lines** - 100% covered

### **Test Architecture**
- **Sophisticated Mock System**: Centralized mocks in `test-utils/` directory
- **Component Testing**: React components with Testing Library
- **API Testing**: Full API route testing with proper mocking
- **Integration Testing**: Database and external service integration
- **Error Boundary Testing**: Comprehensive error handling validation

### **Run Tests**

```bash
# Run all tests
docker exec -it airecipes-app npm run test

# Run tests in watch mode
docker exec -it airecipes-app npm run test:watch

# Run tests with coverage
docker exec -it airecipes-app npm run test:coverage
```

### **Testing Best Practices Demonstrated**
- **Mock Isolation**: Prevents test interdependencies
- **Async Testing**: Proper handling of promises and async operations
- **Error Scenarios**: Testing both success and failure paths
- **Type Safety**: TypeScript integration in test files
- **Performance**: Jest caching for faster test execution

## API Routes

The app includes API routes in the `src/app/api/` directory:

```http
GET  /api/health                           # Health check
POST /api/v1/ai-meals/generate-recipes    # Generate AI recipes from ingredients
GET  /api/v1/ingredients/search           # Search for ingredients
GET  /api/v1/token-usage/stats            # Get OpenAI token usage statistics
GET  /api/v1/token-usage/recent           # Get recent token usage
POST /api/auth/login                      # User authentication
POST /api/auth/logout                     # User logout
GET  /api/auth/verify                     # Verify authentication status
```

## Portfolio Value

This project demonstrates expertise in:

- **Full-Stack Development**: Next.js, TypeScript, PostgreSQL, Redis
- **AI Integration**: OpenAI GPT API integration with fallback mechanisms
- **DevOps & CI/CD**: GitHub Actions, Docker, automated deployment
- **Testing Excellence**: 100% coverage with sophisticated test architecture
- **Production Readiness**: Security, performance, monitoring, and error handling
- **Modern Development Practices**: Type safety, code quality, and maintainability

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
