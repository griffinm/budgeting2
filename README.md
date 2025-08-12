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

## Deploying
To deploy to production, run the deploy script with a param for the server address
```bash
./deploy.sh 192.168.1.1
```
