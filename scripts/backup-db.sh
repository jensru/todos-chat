#!/bin/bash

# Database Backup Script
# Usage: ./scripts/backup-db.sh

PROJECT_DIR="/Users/jensru/Sites/todos"
DB_PATH="$PROJECT_DIR/todo-app-nextjs/prisma/dev.db"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/dev_backup_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating database backup..."
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
    
    # Show backup info
    BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
    echo "📊 Backup size: $BACKUP_SIZE"
    
    # List recent backups
    echo "📁 Recent backups:"
    ls -lt "$BACKUP_DIR"/dev_backup_*.db | head -5
else
    echo "❌ Backup failed!"
    exit 1
fi

