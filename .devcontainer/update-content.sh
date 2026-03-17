#!/bin/bash
# update-content.sh - Runs during prebuild creation AND on prebuild updates
# Source-dependent setup (DB, migrations) goes here so prebuilds stay current.

set -e

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "==> Creating .env from template..."
    cp .env.example .env
fi

# Set up database
echo "==> Setting up database..."
createdb app 2>/dev/null || echo "Database 'app' already exists"

# Run migrations
echo "==> Running database migrations..."
export FLASK_APP=src/app:create_app
flask db upgrade 2>/dev/null || echo "No migrations to apply yet"

echo "==> update-content complete!"
