#!/bin/sh
set -e

echo "Running database migrations..."
npx mikro-orm migration:up

echo "Starting backend..."
exec "$@"
