#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/mnt/nas/backup/automated"
BACKUP_NAME="budgeting2_production"
DB_NAME="budgeting2_development"
DB_USER="griffin"
CONTAINER="budgeting2-db-1"
COMPOSE_FILE="$(dirname "$0")/docker-compose.yml"

# Find the latest backup for this database
LATEST=$(ls -t "$BACKUP_DIR"/${BACKUP_NAME}_*.sql 2>/dev/null | head -1)

if [[ -z "$LATEST" ]]; then
  echo "Error: no backup files found in $BACKUP_DIR for $BACKUP_NAME" >&2
  exit 1
fi

echo "Restoring from: $LATEST"

# Ensure the container is running
if ! docker compose -f "$COMPOSE_FILE" ps --status running | grep -q "$CONTAINER"; then
  echo "Error: container $CONTAINER is not running" >&2
  exit 1
fi

# Drop and recreate the database
docker exec "$CONTAINER" dropdb --if-exists -U "$DB_USER" "$DB_NAME"
docker exec "$CONTAINER" createdb -U "$DB_USER" "$DB_NAME"

# Restore
docker exec -i "$CONTAINER" psql -U "$DB_USER" "$DB_NAME" < "$LATEST"

echo "Done. Restored $DB_NAME from $(basename "$LATEST")"
