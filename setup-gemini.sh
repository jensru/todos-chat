#!/bin/bash

# Setup Script für Gemini API Key
# Usage: ./setup-gemini.sh "dein-api-key"

if [ $# -eq 0 ]; then
    echo "❌ Fehler: Kein API Key angegeben!"
    echo "Usage: ./setup-gemini.sh \"dein-gemini-api-key\""
    exit 1
fi

API_KEY="$1"

echo "🔑 Setze Gemini API Key..."

# API Key in .env Datei speichern
echo "GEMINI_API_KEY=$API_KEY" > .env

# API Key für aktuelle Session setzen
export GEMINI_API_KEY="$API_KEY"

echo "✅ Gemini API Key gesetzt!"
echo "📝 Gespeichert in: .env"
echo ""
echo "🚀 Jetzt kannst du den LLM-Agent testen:"
echo "   ./commit-and-update.sh \"Gemini LLM-Agent test\""
echo ""
echo "💡 Tipp: Füge 'source .env' zu deiner .bashrc/.zshrc hinzu"
echo "   für automatisches Laden des API Keys"
