#!/bin/bash

# Timeline-Organizer Agent
# Erkennt "zu viele Todos" und schlägt Timeline vor

DASHBOARD_FILE="../Dashboard - Strukturierte To-do-Übersicht.md"
OUTPUT_FILE="../timeline-suggestions.md"

echo "🤖 Timeline-Organizer Agent gestartet..."

# Zähle Todos in verschiedenen Bereichen
TOTAL_TODOS=$(grep -c "^- \[ \]" "$DASHBOARD_FILE")
WEDNESDAY_TODOS=$(grep -A 20 "### \*\*Mittwoch" "$DASHBOARD_FILE" | grep -c "^- \[ \]")
THURSDAY_TODOS=$(grep -A 20 "### \*\*Donnerstag" "$DASHBOARD_FILE" | grep -c "^- \[ \]")

echo "📊 Analyse:"
echo "  - Gesamt Todos: $TOTAL_TODOS"
echo "  - Mittwoch Todos: $WEDNESDAY_TODOS"
echo "  - Donnerstag Todos: $THURSDAY_TODOS"

# Erstelle Timeline-Vorschläge
cat > "$OUTPUT_FILE" << EOF
# 🤖 Timeline-Organizer Vorschläge

## 📊 **Aktuelle Analyse**
- **Gesamt Todos**: $TOTAL_TODOS
- **Mittwoch Todos**: $WEDNESDAY_TODOS
- **Donnerstag Todos**: $THURSDAY_TODOS

## ⚠️ **Probleme erkannt:**
EOF

# Prüfe auf Probleme
if [ $WEDNESDAY_TODOS -gt 8 ]; then
    echo "- **Mittwoch überladen**: $WEDNESDAY_TODOS Todos (empfohlen: max 8)" >> "$OUTPUT_FILE"
fi

if [ $THURSDAY_TODOS -gt 8 ]; then
    echo "- **Donnerstag überladen**: $THURSDAY_TODOS Todos (empfohlen: max 8)" >> "$OUTPUT_FILE"
fi

if [ $TOTAL_TODOS -gt 50 ]; then
    echo "- **Gesamt überladen**: $TOTAL_TODOS Todos (empfohlen: max 50)" >> "$OUTPUT_FILE"
fi

cat >> "$OUTPUT_FILE" << EOF

## 💡 **Timeline-Vorschläge:**

### **Mittwoch (heute) - Optimiert:**
1. **Emails** 📧 (15 min)
2. **Tabs** 🗂️ (10 min)
3. **Todos** ✅ (10 min)
4. **Geld abheben** 💰 (20 min)
5. **Werk1** 🏢 (60 min)
6. **Arbeitsblock 1**: Positionierung & Posts (90 min)
7. **V-Markt** 🛒 (30 min)
8. **Joggen** 🏃‍♂️ (45 min)
9. **Arbeitsblock 2**: Restliche Todos (60 min)

### **Donnerstag - Geld-Fokus:**
- **Pricing-Strategie** (120 min)
- **Leadmagneten** (90 min)
- **Workshop-Format** (60 min)
- **Newsletter-Setup** (60 min)

### **Freitag - Community:**
- **Funnel-Strategien** (90 min)
- **Community-Outreach** (60 min)
- **Website-Tools** (60 min)

## 🎯 **Empfehlungen:**
- **Max 8 Todos pro Tag**
- **Arbeitsblöcke von 60-90 min**
- **Pausen zwischen Blöcken**
- **Fokus auf eine Hauptkategorie pro Tag**

---
*Generiert am $(date +"%d. %B %Y um %H:%M")*
EOF

echo "✅ Timeline-Vorschläge erstellt: $OUTPUT_FILE"
echo "🌐 Website wird automatisch aktualisiert..."
