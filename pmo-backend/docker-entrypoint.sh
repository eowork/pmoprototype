#!/bin/sh
set -e

echo "Running database migrations..."
npx mikro-orm migration:up --config ./dist/database/mikro-orm.config.js

echo "Starting backend..."
exec "$@"
