#!/bin/bash

# Auto-Datums-Update Script für Dashboard
# Usage: ./update-dates.sh

# Aktuelles Datum ermitteln
CURRENT_DATE=$(date +"%d. %B %Y")
CURRENT_WEEK_START=$(date -v-mon +"%d. %B" 2>/dev/null || date -d "monday" +"%d. %B" 2>/dev/null)
CURRENT_WEEK_END=$(date -v-sun +"%d. %B" 2>/dev/null || date -d "sunday" +"%d. %B" 2>/dev/null)
CURRENT_YEAR=$(date +"%Y")

echo "🕐 Aktualisiere Datum: $CURRENT_DATE"
echo "📅 Woche: $CURRENT_WEEK_START - $CURRENT_WEEK_END $CURRENT_YEAR"

# Dashboard-Datei aktualisieren
DASHBOARD_FILE="Dashboard - Strukturierte To-do-Übersicht.md"

# Aktuelles Datum in der Datei ersetzen
sed -i '' "s/_Heute: .*/_Heute: $CURRENT_DATE_/" "$DASHBOARD_FILE"
sed -i '' "s/_Letzte Aktualisierung: .*/_Letzte Aktualisierung: $CURRENT_DATE_/" "$DASHBOARD_FILE"

# Woche aktualisieren
sed -i '' "s/## 📅 \*\*Diese Woche (.*)\*\*/## 📅 **Diese Woche ($CURRENT_WEEK_START - $CURRENT_WEEK_END $CURRENT_YEAR)**/" "$DASHBOARD_FILE"

echo "✅ Datum aktualisiert!"
echo "📝 Dashboard: $DASHBOARD_FILE"
