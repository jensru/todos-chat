#!/bin/bash

# Log-Rotation für Research Log
# Behält nur die letzten N Einträge und archiviert den Rest

RESEARCH_LOG="research/chatfirst-research-log.md"
ARCHIVE_DIR="research/archive"
MAX_ENTRIES=20  # Nur die letzten 20 Mistral-Einträge behalten

echo "🔄 Starte Log-Rotation für Research Log..."

# Archive-Verzeichnis erstellen falls nicht vorhanden
mkdir -p "$ARCHIVE_DIR"

# Timestamp für Archiv
ARCHIVE_TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
ARCHIVE_FILE="$ARCHIVE_DIR/research-log-archive-$ARCHIVE_TIMESTAMP.md"

# Mistral-Einträge zählen
MISTRAL_COUNT=$(grep -c "## 🤖 \*\*Mistral-Automatisierte Analyse" "$RESEARCH_LOG")

echo "📊 Aktuelle Mistral-Einträge: $MISTRAL_COUNT"

if [ "$MISTRAL_COUNT" -le "$MAX_ENTRIES" ]; then
    echo "✅ Keine Rotation nötig - nur $MISTRAL_COUNT Einträge (Limit: $MAX_ENTRIES)"
    exit 0
fi

echo "🔄 Rotation nötig - erstelle Archiv..."

# Header und Grundstruktur extrahieren (bis zum ersten Mistral-Eintrag)
HEADER_LINE=$(grep -n "## 🤖 \*\*Mistral-Automatisierte Analyse" "$RESEARCH_LOG" | head -1 | cut -d: -f1)
HEADER_LINE=$((HEADER_LINE - 1))

# Header in neues Log kopieren
head -n "$HEADER_LINE" "$RESEARCH_LOG" > "${RESEARCH_LOG}.new"

# Alle Mistral-Einträge finden
MISTRAL_LINES=$(grep -n "## 🤖 \*\*Mistral-Automatisierte Analyse" "$RESEARCH_LOG")

# Letzte N Einträge behalten
echo "" >> "${RESEARCH_LOG}.new"
echo "---" >> "${RESEARCH_LOG}.new"
echo "" >> "${RESEARCH_LOG}.new"
echo "## 📚 **Aktuelle Mistral-Analysen (letzte $MAX_ENTRIES Einträge)**" >> "${RESEARCH_LOG}.new"
echo "" >> "${RESEARCH_LOG}.new"

# Letzte N Mistral-Einträge extrahieren
echo "$MISTRAL_LINES" | tail -n "$MAX_ENTRIES" | while read line; do
    LINE_NUM=$(echo "$line" | cut -d: -f1)
    NEXT_LINE_NUM=$(echo "$MISTRAL_LINES" | grep -A1 "^$LINE_NUM:" | tail -1 | cut -d: -f1)
    
    if [ -z "$NEXT_LINE_NUM" ]; then
        # Letzter Eintrag - bis zum Ende
        sed -n "${LINE_NUM},\$p" "$RESEARCH_LOG" >> "${RESEARCH_LOG}.new"
    else
        # Bis zum nächsten Eintrag
        sed -n "${LINE_NUM},$((NEXT_LINE_NUM-1))p" "$RESEARCH_LOG" >> "${RESEARCH_LOG}.new"
    fi
done

# Altes Log archivieren
cp "$RESEARCH_LOG" "$ARCHIVE_FILE"

# Neues Log aktivieren
mv "${RESEARCH_LOG}.new" "$RESEARCH_LOG"

echo "✅ Log-Rotation abgeschlossen!"
echo "📚 Archiviert: $ARCHIVE_FILE"
echo "📊 Neue Einträge: $MAX_ENTRIES"
echo "🗂️  Archiv-Verzeichnis: $ARCHIVE_DIR"
