#!/bin/bash

# Mistral API Key Setup
# Usage: ./setup-mistral-api.sh

echo "🔑 Mistral API Key Setup"
echo "========================"
echo ""

# Prüfen ob bereits konfiguriert
if [ -f ".mistral_api_key" ]; then
    echo "✅ Mistral API Key bereits konfiguriert"
    echo "Key: $(head -c 10 .mistral_api_key)..."
    echo ""
    read -p "Neuen Key eingeben? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup abgebrochen"
        exit 0
    fi
fi

echo "📝 Mistral API Key eingeben:"
echo "1. Gehe zu: https://console.mistral.ai/"
echo "2. Erstelle einen API Key"
echo "3. Kopiere den Key hier ein"
echo ""

read -p "API Key: " -s MISTRAL_API_KEY
echo ""

if [ -z "$MISTRAL_API_KEY" ]; then
    echo "❌ Kein API Key eingegeben"
    exit 1
fi

# Key in Datei speichern
echo "$MISTRAL_API_KEY" > .mistral_api_key
chmod 600 .mistral_api_key

echo "✅ API Key gespeichert in .mistral_api_key"
echo ""

# Test API Call
echo "🧪 Teste API Key..."
TEST_RESPONSE=$(./mistral-api.sh "Sage einfach 'API Key funktioniert!'")

if [ $? -eq 0 ]; then
    echo "✅ Mistral API Key funktioniert!"
    echo ""
    echo "📋 Verfügbare Befehle:"
    echo "- ./mistral-api.sh \"Dein Prompt\""
    echo "- ./alignment-dashboard.sh --mistral (für automatische Interpretationen)"
    echo "- ./commit-and-update.sh \"Nachricht\" --mistral (für automatische Analysen)"
else
    echo "❌ API Key Test fehlgeschlagen"
    echo "Prüfe deinen Key auf: https://console.mistral.ai/"
fi
