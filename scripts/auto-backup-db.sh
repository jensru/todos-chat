#!/bin/bash

# Auto Database Backup Script
# Runs every 30 minutes automatically

PROJECT_DIR="/Users/jensru/Sites/todos"
DB_PATH="$PROJECT_DIR/todo-app-nextjs/prisma/dev.db"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/dev_backup_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "$(date): ✅ Auto-backup created: $BACKUP_FILE" >> "$BACKUP_DIR/backup.log"
    
    # Keep only last 10 backups to save space
    cd "$BACKUP_DIR"
    ls -t dev_backup_*.db | tail -n +11 | xargs -r rm
else
    echo "$(date): ❌ Auto-backup failed!" >> "$BACKUP_DIR/backup.log"
fi

