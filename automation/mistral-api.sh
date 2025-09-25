#!/bin/bash

# Mistral API Integration für Chat-First Research
# Usage: ./mistral-api.sh "Prompt für Mistral"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Prompt für Mistral\""
    exit 1
fi

PROMPT="$1"
# Sonderzeichen escapen für JSON
PROMPT=$(echo "$PROMPT" | sed 's/"/\\"/g' | sed 's/\\/\\\\/g' | tr '\n' ' ')

# API Key aus Umgebungsvariable oder Datei lesen
if [ -z "$MISTRAL_API_KEY" ]; then
    if [ -f ".mistral_api_key" ]; then
        MISTRAL_API_KEY=$(cat .mistral_api_key)
    else
        echo "❌ Mistral API Key nicht gefunden!"
        echo "Setze MISTRAL_API_KEY Umgebungsvariable oder erstelle .mistral_api_key Datei"
        exit 1
    fi
fi

# Mistral API Call
echo "🤖 Mistral API wird aufgerufen..."

RESPONSE=$(curl -s -X POST "https://api.mistral.ai/v1/chat/completions" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"mistral-small\",
    \"messages\": [
      {
        \"role\": \"system\", 
        \"content\": \"Du bist ein hilfreicher Assistent für Chat-First Tool-Entwicklung und Alignment-Tracking. Antworte auf Deutsch und fokussiere auf praktische, umsetzbare Empfehlungen.\"
      },
      {
        \"role\": \"user\", 
        \"content\": \"$PROMPT\"
      }
    ],
    \"max_tokens\": 500,
    \"temperature\": 0.7
  }")

# Response parsen und anzeigen
if [ $? -eq 0 ]; then
    echo "✅ Mistral Response:"
    echo "$RESPONSE" | python3 -c "
import json
import sys
try:
    data = json.load(sys.stdin)
    if 'choices' in data and len(data['choices']) > 0:
        print(data['choices'][0]['message']['content'])
    else:
        print('Fehler in API Response:', data)
except:
    print('Fehler beim Parsen der Response')
"
else
    echo "❌ Fehler beim API Call"
    exit 1
fi
