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

## Deployment

Pushing to `main` builds the API and UI Docker images and deploys them to the production
host via GitHub Actions. For the full picture — CI/CD pipeline, images, the production host,
configuration, and secrets — see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).
