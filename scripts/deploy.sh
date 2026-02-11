#!/bin/bash

# Configuration
SERVER_IP="188.68.32.75"
SERVER_USER="sunlinermicha"
APP_DIR="/var/www/hilfevonnebenan"

echo "🚀 Starting deployment to $SERVER_IP..."

# 1. Push changes to GitHub (optional but recommended)
# git push origin main

# 2. Sync files to server (excluding node_modules, .next, etc.)
echo "📦 Syncing files to server..."
rsync -avz --exclude-from='.dockerignore' ./ $SERVER_USER@$SERVER_IP:$APP_DIR

# 3. SSH into server and restart containers
# 3. SSH into server and restart containers
echo "🔄 Restarting containers on server..."
ssh $SERVER_USER@$SERVER_IP "cd $APP_DIR && docker compose up -d --build"

# 4. Run Seed Script (Idempotent)
echo "🌱 Seeding plans (if needed)..."
ssh $SERVER_USER@$SERVER_IP "cat $APP_DIR/scripts/seed-plans.sql | docker compose exec -T database psql -U postgres -d hilfevonnebenan"

echo "✅ Deployment finished!"
