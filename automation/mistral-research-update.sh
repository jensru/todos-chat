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

# Kontext-bewusste Mistral-Analyse verwenden
echo "🧠 Verwende kontext-bewusste Analyse..."
MISTRAL_RESPONSE=$(./automation/mistral-context-aware.sh "$COMMIT_MSG")

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
