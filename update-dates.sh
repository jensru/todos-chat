#!/bin/bash

# Auto-Datums-Update Script für Dashboard
# Usage: ./update-dates.sh

# Aktuelles Datum ermitteln
CURRENT_DATE=$(date +"%d. %B %Y")
CURRENT_YEAR=$(date +"%Y")

# Woche dynamisch berechnen
CURRENT_DAY=$(date +"%d")
CURRENT_MONTH=$(date +"%B")
CURRENT_YEAR=$(date +"%Y")

# Woche berechnen (Montag bis Sonntag)
WEEK_START_DAY=$((CURRENT_DAY - $(date +"%u") + 1))
WEEK_END_DAY=$((WEEK_START_DAY + 6))

WEEK_START="$WEEK_START_DAY. $CURRENT_MONTH"
WEEK_END="$WEEK_END_DAY. $CURRENT_MONTH"

echo "🕐 Aktualisiere Datum: $CURRENT_DATE"
echo "📅 Woche: $WEEK_START - $WEEK_END $CURRENT_YEAR"

# Dashboard-Datei aktualisieren
DASHBOARD_FILE="Dashboard - Strukturierte To-do-Übersicht.md"

# Aktuelles Datum in der Datei ersetzen
sed -i '' "s/_Heute: .*/_Heute: $CURRENT_DATE_/" "$DASHBOARD_FILE"
sed -i '' "s/_Letzte Aktualisierung: .*/_Letzte Aktualisierung: $CURRENT_DATE_/" "$DASHBOARD_FILE"

# Woche aktualisieren
sed -i '' "s/## 📅 \*\*Diese Woche (.*)\*\*/## 📅 **Diese Woche ($WEEK_START - $WEEK_END $CURRENT_YEAR)**/" "$DASHBOARD_FILE"

echo "✅ Datum aktualisiert!"
echo "📝 Dashboard: $DASHBOARD_FILE"
