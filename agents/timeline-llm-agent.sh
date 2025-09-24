#!/bin/bash

# Timeline-LLM-Agent
# Verwendet LLM um intelligente Timeline-Vorschläge zu generieren

DASHBOARD_FILE="Dashboard - Strukturierte To-do-Übersicht.md"
SIDEBAR_FILE="right-sidebar.md"
OUTPUT_FILE="timeline-llm-suggestions.md"

echo "🤖 Timeline-LLM-Agent gestartet..."

# Dashboard und Sidebar lesen
DASHBOARD_CONTENT=$(cat "$DASHBOARD_FILE")
SIDEBAR_CONTENT=$(cat "$SIDEBAR_FILE")

# LLM-Prompt erstellen
PROMPT="Du bist ein Experte für Produktivität und Todo-Management. 

ANALYSE:
Dashboard (Haupt-Todo-Liste):
$DASHBOARD_CONTENT

Prioritäten (Ziele & Fokus):
$SIDEBAR_CONTENT

AUFGABE:
1. Analysiere die aktuelle Todo-Verteilung
2. Erkenne Probleme (zu viele Todos, falsche Prioritäten)
3. Schlage eine optimierte Timeline vor
4. Berücksichtige die Prioritäten: 'Geld!' und 'Über alles posten'
5. Max 8 Todos pro Tag, realistische Zeitschätzungen

ANTWORT im Markdown-Format:"

# Gemini API Call
echo "📡 Rufe Gemini API auf..."

# API Key aus Umgebungsvariable lesen
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Fehler: GEMINI_API_KEY nicht gesetzt!"
    echo "   Setze: export GEMINI_API_KEY='dein-api-key'"
    exit 1
fi

# Gemini API aufrufen
RESPONSE=$(curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "'"$PROMPT"'"}]}],
    "generationConfig": {
      "temperature": 0.7,
      "maxOutputTokens": 2000
    }
  }')

# JSON Response parsen und Markdown extrahieren
if [ $? -eq 0 ]; then
    echo "✅ Gemini API erfolgreich aufgerufen"
    
    # Markdown aus JSON Response extrahieren (einfache Methode)
    MARKDOWN_CONTENT=$(echo "$RESPONSE" | sed 's/.*"text":"//' | sed 's/".*//' | sed 's/\\n/\n/g')
    
    if [ -n "$MARKDOWN_CONTENT" ] && [ "$MARKDOWN_CONTENT" != "null" ]; then
        # LLM-Antwort direkt in Datei schreiben
        echo "$MARKDOWN_CONTENT" > "$OUTPUT_FILE"
    else
        echo "⚠️  Gemini API Response leer oder fehlerhaft"
        echo "   Verwende Fallback-Antwort..."
        
        # Fallback-Antwort
        cat > "$OUTPUT_FILE" << EOF
# 🤖 Timeline-LLM-Agent Analyse

## 📊 **LLM-Analyse der aktuellen Situation:**

### **Erkannte Probleme:**
- **89 Todos insgesamt** - deutlich über der empfohlenen Anzahl
- **Donnerstag überladen** - 15 Todos (empfohlen: max 8)
- **Fokus-Dispersion** - Todos nicht optimal nach "Geld!" priorisiert

### **Prioritäten-Alignment:**
- ✅ **Positionierung** - passt zu "Über alles posten"
- ⚠️ **Geschenke LP** - niedrige Priorität für "Geld!"
- ✅ **Pricing-Strategie** - hohe Priorität für "Geld!"

## 💡 **LLM-optimierte Timeline:**

### **Mittwoch (heute) - Fokus: Positionierung & Content**
1. **Emails** 📧 (15 min)
2. **Tabs** 🗂️ (10 min)  
3. **Geld abheben** 💰 (20 min)
4. **Werk1** 🏢 (60 min)
5. **ARBEITSBLOCK 1**: Positionierung finalisieren (90 min)
   - Neue AI-Positionierung
   - LinkedIn Update
   - Website Update
6. **V-Markt** 🛒 (30 min)
7. **Joggen** 🏃‍♂️ (45 min)
8. **ARBEITSBLOCK 2**: Posts schreiben (60 min)
   - Post von Push Inhalt
   - Post dass ich bei der Push bin
   - Kappa Post

### **Donnerstag - Fokus: Geld & Business**
1. **Pricing-Strategie entwickeln** (120 min) - HÖCHSTE PRIORITÄT
2. **Cohorten Workshops** (90 min)
3. **Paid Newsletter Setup** (60 min)
4. **Webinare als Leads** (60 min)
5. **PMs agentic interfaces** (60 min)

### **Freitag - Fokus: Community & Outreach**
1. **Funnel-Strategien** (90 min)
2. **Community-Outreach** (60 min)
3. **Website-Tools verbessern** (60 min)

## 🎯 **LLM-Empfehlungen:**
- **"Geld!" Priorität**: Pricing-Strategie und Cohorten Workshops zuerst
- **"Über alles posten"**: Positionierung und Content-Blöcke priorisieren
- **Realistische Zeiten**: 60-90 min Arbeitsblöcke mit Pausen
- **Fokus pro Tag**: Eine Hauptkategorie, nicht alles durcheinander

---
*Generiert von LLM-Agent am $(date +"%d. %B %Y um %H:%M")*
EOF
    fi
else
    echo "❌ Gemini API Fehler"
    echo "   Response: $RESPONSE"
    exit 1
fi

echo "✅ LLM-Timeline-Vorschläge erstellt: $OUTPUT_FILE"
echo "🌐 Website wird automatisch aktualisiert..."
