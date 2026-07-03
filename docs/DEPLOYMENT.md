# Deployment & Production Environment

This document describes how the budgeting app is built, shipped, and run in production. The
authoritative deployment path is the GitHub Actions pipeline described below.

## Overview

The app ships as **two Docker images** that run as **two `docker compose` services** on a
single self-hosted host:

| Image | Built from | Runtime | Port | Role |
|-------|-----------|---------|------|------|
| `budgeting2-api` | `Dockerfile.api` | Rails 8 + Puma | `3000` | JSON API + background jobs |
| `budgeting2-ui`  | `Dockerfile.ui`  | nginx + static React build | `80` | Serves the SPA, reverse-proxies `/api` → API |

Images are pushed to a **private registry** and pulled onto the production host, where a
`docker compose` stack (Postgres + the two app services) runs them.

```
 git push main
      │
      ▼
┌─────────────────────────────┐
│ GitHub Actions              │   .github/workflows/ci.yml
│ (self-hosted runner)        │   job: build-and-deploy
│                             │
│  docker build api + ui      │
│  docker push  ──────────────┼──►  Registry: nas.malfin.com:10100
│  ssh server-vm              │        budgeting2-api:<sha>-<run#>
└──────────────┬──────────────┘        budgeting2-ui:<sha>-<run#>
               │ ssh (griffin@server-vm)
               ▼
┌─────────────────────────────────────────────────────────────┐
│ Production host: server-vm                                   │
│ /home/griffin/docker/                                        │
│                                                              │
│   .env         BUDGETING_API_IMAGE / BUDGETING_UI_IMAGE      │
│   docker-compose.yml  (lives ON THE HOST, not in this repo)  │
│                                                              │
│   ┌────────────┐   /api    ┌──────────────┐   ┌───────────┐  │
│   │ budgeting2 │──────────►│ budgeting-api │──►│ postgres  │  │
│   │ -ui (nginx)│           │ (Puma :3000)  │   │ :5432     │  │
│   │  :80       │◄──── SPA  │  + Solid Queue│   └───────────┘  │
│   └────────────┘           └──────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

## Continuous deployment pipeline

Defined in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

- **Trigger:** every push to the `main` branch.
- **Runner:** a **self-hosted** GitHub Actions runner (`runs-on: self-hosted`).
- **Job `build-and-deploy`:**
  1. **Compute image tag** — `TAG = <short-sha (7)>-<GITHUB_RUN_NUMBER>` (e.g. `a1b2c3d-142`).
  2. **Build** `budgeting2-api` (from `Dockerfile.api`) and `budgeting2-ui` (from `Dockerfile.ui`).
  3. **Push** both images to the registry `nas.malfin.com:10100`.
  4. **Deploy** over SSH (`appleboy/ssh-action`) to host `server-vm` as user `griffin`
     (auth via the `DEPLOY_SSH_KEY` GitHub secret). The remote script:
     - Rewrites `BUDGETING_API_IMAGE` / `BUDGETING_UI_IMAGE` in `/home/griffin/docker/.env`
       to point at the new tags (via `sed`).
     - `cd /home/griffin/docker`
     - `docker compose pull budgeting-api budgeting2-ui`
     - `docker compose up -d budgeting-api budgeting2-ui`

> ⚠️ **The test, lint, and Brakeman jobs are currently commented out** (see commit
> `b86e9d8`, "disable test/lint jobs temporarily"). This means **pushing to `main` deploys
> straight to production with no CI gate.** Run `bundle exec rspec` locally before merging,
> and consider re-enabling those jobs.

## Production host & runtime

- **Host:** `server-vm` (SSH as `griffin`).
- **Compose project directory:** `/home/griffin/docker/`.
- **Compose file:** lives **on the host**, not in this repository. This repo's
  `docker-compose.yml` only defines a local Postgres for development — it is *not* the
  production stack.
- **Service names** (as referenced by the pipeline and nginx):
  - `budgeting-api` — the Rails/Puma container. nginx proxies to `budgeting-api:3000`.
  - `budgeting2-ui` — the nginx/React container.
  - Postgres (and the `.env`) are managed on the host.

### API container (`Dockerfile.api`)

- Base `ruby:3.4.2-slim`, multi-stage build, runs as non-root user `rails` (uid/gid 1000).
- `RAILS_ENV=production`, `SOLID_QUEUE_IN_PUMA=true` baked in.
- **Entrypoint** [`bin/docker-entrypoint`](../bin/docker-entrypoint): enables jemalloc and,
  when the command is `rails server`, runs `bin/rails db:prepare` (creates + migrates the DB)
  on every boot. **Migrations run automatically at container start** — there is no separate
  migration step in the pipeline.
- **Command:** `bin/rails server -b 0.0.0.0 -p 3000` (Puma). See [`config/puma.rb`](../config/puma.rb):
  threads = `RAILS_MAX_THREADS` (default 3), workers = `WEB_CONCURRENCY` (default 1).

### UI container (`Dockerfile.ui`)

- Stage 1: `node:20-alpine`, `npm ci` + `npm run build` in `ui/` → static `dist/`.
- Stage 2: `nginx:alpine` serving `dist/` on port 80, using [`nginx.conf`](../nginx.conf):
  - `location /api` → `proxy_pass http://budgeting-api:3000` (60s timeouts, WebSocket upgrade headers).
  - `location /` → `try_files ... /index.html` (SPA client-side routing).
  - gzip on; hashed static assets cached `1y, immutable`.

## Background jobs

Jobs run via **Solid Queue** (database-backed), **not** Sidekiq.

- `config/environments/production.rb`: `config.active_job.queue_adapter = :solid_queue`.
- `SOLID_QUEUE_IN_PUMA=true` makes the Solid Queue **supervisor run inside the Puma process**
  (`config/puma.rb` → `plugin :solid_queue`). No separate worker container is deployed.
- Recurring/maintenance jobs are configured in [`config/recurring.yml`](../config/recurring.yml)
  (e.g. clearing finished Solid Queue jobs).
- Jobs are stored in the primary Postgres database (`budgeting2_production`); there is no
  separate queue database.

## Database

- **Engine:** PostgreSQL. Production database is `budgeting2_production`
  (see [`config/database.yml`](../config/database.yml)).
- Connection is driven by env vars: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`,
  `DATABASE_PASSWORD` (defaults `localhost:5432` / `griffin`). In production these point at
  the Postgres service in the host's compose stack.
- **Schema is applied automatically** by `db:prepare` in the entrypoint on each API boot.

### Backups & restore

- Automated SQL dumps are written to the NAS at `/mnt/nas/backup/automated/`, named
  `budgeting2_production_*.sql`.
- [`restore-db.sh`](../restore-db.sh) restores the **latest** dump. ⚠️ Note it targets the
  **local development** database (`budgeting2_development`, container `budgeting2-db-1` from
  this repo's `docker-compose.yml`) — it's a "pull prod backup into local dev" tool, not a
  production restore script.

## Configuration & secrets

Production configuration is supplied via environment variables in `/home/griffin/docker/.env`
on the host. [`env.production.template`](../env.production.template) documents the expected
variables. Key ones:

| Variable | Purpose |
|----------|---------|
| `BUDGETING_API_IMAGE` / `BUDGETING_UI_IMAGE` | Image tags, rewritten by the deploy pipeline |
| `RAILS_ENV=production` | |
| `RAILS_MASTER_KEY` | Decrypts `config/credentials`. From `config/master.key` (**never commit**). |
| `SECRET_KEY_BASE` | Rails secret (generate with `openssl rand -hex 64`). |
| `DATABASE_URL` / `DATABASE_*` | Postgres connection. |
| `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` | Plaid bank integration. |
| `SES_SMTP_HOST`, `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD` | AWS SES SMTP (email). |
| `RAILS_FORCE_SSL` | Override forced SSL (defaults to `true`). |
| `RAILS_MAX_THREADS`, `WEB_CONCURRENCY` | Puma tuning. |

### TLS / SSL

`config/environments/production.rb` sets `config.assume_ssl = true` and
`config.force_ssl = true` (overridable via `RAILS_FORCE_SSL`). The app expects to sit behind
a **TLS-terminating reverse proxy** (the nginx UI container and/or an upstream proxy); it does
not terminate TLS itself.

### Email

Outbound mail goes through **AWS SES over SMTP** (`aws-sdk-sesv2` gem; SMTP settings in
`production.rb`). Host defaults to `email-smtp.us-east-1.amazonaws.com`; credentials come from
`SES_SMTP_USERNAME` / `SES_SMTP_PASSWORD`. `ACTION_MAILER` default URL host comes from `APP_HOST`.

## Manual build & push (fallback)

[`push-to-docker.sh`](../push-to-docker.sh) does the same build+push as CI, by hand:

- Builds `budgeting2-api` / `budgeting2-ui` and pushes to `nas.malfin.com:10100`.
- Tags as `<short-sha>-<version>`, where `version` is read from and incremented in
  `current_version_number.txt`.

> Note: CI tags with `GITHUB_RUN_NUMBER`, **not** `current_version_number.txt`, so that file
> only advances when someone runs `push-to-docker.sh` manually. This script does **not** deploy
> — it only builds and pushes. Deployment (updating `.env` + `docker compose up`) is still manual
> from the host after a manual push.

## Quick reference

```bash
# Deploy: just push to main (CI builds, pushes, and deploys)
git push origin main

# Manual image build + push (no deploy)
./push-to-docker.sh

# On the production host (server-vm), after a manual push:
cd /home/griffin/docker
# edit .env → set BUDGETING_API_IMAGE / BUDGETING_UI_IMAGE
docker compose pull budgeting-api budgeting2-ui
docker compose up -d budgeting-api budgeting2-ui
docker compose logs -f budgeting-api      # tail API logs
docker compose exec budgeting-api bin/rails console   # prod console
```
