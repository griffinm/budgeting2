# Bear Budget

## Overview
This repo contains 2 apps, a front end and a back end. 
* **Front End** - A react application. This can be found in the "ui" folder in the root.
* **Back End** - A ruby on rails application. This is located at the root of the application 

## Initial Dev Setup
```bash
bundle            # Install ruby deps for the API
rake db:migrate   # Run all DB migrations
(cd ui & npm i)   # Install node deps for the UI
```

## Running in development
Foreman is used as a process manager to start both the front and back end with 1 command:

```bash
foreman start
```

To start the FE and BE seperately:
```bash
rails s                   # Start the BE
(cd ui & npm run start)   # Srart the FE
```

## Docker Deployment (Recommended for Local Production)

The application can be deployed using Docker for a production-like environment on your local machine.

### Quick Start (3 steps)

1. **Generate secrets:**
   ```bash
   ./generate-keys.sh
   ```

2. **Review configuration:**
   ```bash
   nano .env.production  # Edit if needed
   ```

3. **Deploy:**
   ```bash
   ./deploy-prod.sh
   ```

### Access the Application

- **UI:** http://localhost:11100
- **API:** http://localhost:11000

### Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Comprehensive documentation
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- [DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md) - Architecture overview

### Key Features

- ✅ All services run in Docker containers
- ✅ UI reverse proxies `/api` to the API service
- ✅ Automatic restart on failure
- ✅ Organized under "prod" in Docker Desktop
- ✅ Only stores "latest" image tags
- ✅ Includes PostgreSQL and Redis

## Remote Server Deployment

To deploy to a remote production server, run the deploy script with a param for the server address:
```bash
./deploy.sh 192.168.1.1
```
