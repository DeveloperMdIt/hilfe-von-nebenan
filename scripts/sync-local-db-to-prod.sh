#!/bin/bash

# Configuration
LOCAL_DB_URL="postgresql://postgres:password123@localhost:5177/hilfevonnebenan"
SERVER_IP="188.68.32.75"
SERVER_USER="sunlinermicha"
APP_DIR="/var/www/hilfevonnebenan"
DUMP_FILE="db_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "⏳ Dumping local database..."
# Use pg_dump to create a backup
# We use --clean and --if-exists to make the restore easier on the other side
pg_dump -d "$LOCAL_DB_URL" --clean --if-exists --no-owner --no-privileges > "$DUMP_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Local dump failed!"
    exit 1
fi

echo "📦 Uploading dump to server..."
scp "$DUMP_FILE" $SERVER_USER@$SERVER_IP:$APP_DIR/production_backup.sql

if [ $? -ne 0 ]; then
    echo "❌ Upload failed!"
    exit 1
fi

echo "🔄 Restoring database on server..."
# Pipe the SQL to the database container's psql
ssh $SERVER_USER@$SERVER_IP "cat $APP_DIR/production_backup.sql | docker compose -f $APP_DIR/docker-compose.yml exec -T database psql -U postgres -d hilfevonnebenan"

if [ $? -ne 0 ]; then
    echo "❌ Restore failed!"
    exit 1
fi

echo "✅ Database sync finished!"
rm "$DUMP_FILE"
