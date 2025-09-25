#!/bin/bash

# Mistral-basierte Research Log Updates
# Usage: ./mistral-research-update.sh "Commit message"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"Commit message\""
    exit 1
fi

COMMIT_MSG="$1"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
RESEARCH_LOG="chatfirst-research-log.md"

echo "🤖 Mistral analysiert Commit für Research Log..."

# Git-Diff analysieren
CHANGED_FILES=$(git diff --cached --name-only | tr '\n' ', ')
CHANGED_CONTENT=$(git diff --cached --stat)

# Mistral Prompt erstellen
MISTRAL_PROMPT="Analysiere diese Git-Änderungen für Chat-First Research:

Commit Message: $COMMIT_MSG
Geänderte Dateien: $CHANGED_FILES
Änderungsstatistik: $CHANGED_CONTENT

Identifiziere:
1. Welche Chat-First-Features wurden verwendet?
2. Welche Patterns sind erkennbar?
3. Welche Tool-Requirements ergeben sich?
4. Welche User-Feedback-Loops gab es?

Antworte in strukturiertem Format für Research Log."

# Mistral API aufrufen
echo "📊 Mistral analysiert..."
MISTRAL_RESPONSE=$(./mistral-api.sh "$MISTRAL_PROMPT")

# Research Log erweitern
cat >> "$RESEARCH_LOG" << EOF

---

## 🤖 **Mistral-Automatisierte Analyse: $TIMESTAMP**

### **📋 Commit-Analyse:**
**Commit:** $COMMIT_MSG
**Dateien:** $CHANGED_FILES

### **🎯 Mistral-Erkenntnisse:**
$MISTRAL_RESPONSE

### **📊 Automatisierungs-Level:**
- **Trigger:** Git Commit
- **Analyse:** Mistral API
- **Integration:** Automatisch in Research Log

EOF

echo "✅ Research Log automatisch erweitert!"
echo "📊 Mistral-Analyse hinzugefügt"
