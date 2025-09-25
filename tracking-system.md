# 📊 **Tracking-System - Rohdaten für spätere Analysen**

## 🎯 **Philosophie:**
**"Track first, analyze later"** - Sammle Rohdaten, analysiere später mit LLMs

## 📋 **Was wir tracken:**

### **1. Todo-Bewegungen:**
```json
{
  "todo_movements": [
    {
      "timestamp": "2025-09-25T10:30:00Z",
      "todo_id": "pricing-strategy",
      "source_day": "Donnerstag",
      "target_day": "Freitag",
      "reason": "Wiesn-Info: Weniger Zeit verfügbar",
      "user_decision": "manually_moved"
    }
  ]
}
```

### **2. Triage-Entscheidungen:**
```json
{
  "triage_decisions": [
    {
      "timestamp": "2025-09-25T10:30:00Z",
      "trigger": "Wiesn-Info",
      "decision_type": "mass_migration",
      "affected_todos": ["pricing-strategy", "leadmagneten-funnels"],
      "reason": "External event reduces available time",
      "confidence": 0.9
    }
  ]
}
```

### **3. Commit-Patterns:**
```json
{
  "commit_patterns": [
    {
      "timestamp": "2025-09-25T10:30:00Z",
      "commit_message": "Startroutine dokumentiert",
      "files_changed": ["Dashboard - Strukturierte To-do-Übersicht.md"],
      "change_type": "structure_modification",
      "patterns_identified": ["startroutine_creation", "triage_pattern"]
    }
  ]
}
```

### **4. User-Feedback:**
```json
{
  "user_feedback": [
    {
      "timestamp": "2025-09-25T10:30:00Z",
      "context": "startroutine_creation",
      "feedback": "ja aber bitte zu den todos heute",
      "action_taken": "content_preserved_in_startroutine",
      "satisfaction": "positive"
    }
  ]
}
```

## 🔄 **Automatisierung:**

### **Via commit-and-update.sh:**
- ✅ **Git-Diff-Tracking** - Welche Dateien geändert wurden
- ✅ **Timestamp-Tracking** - Wann was passiert ist
- ✅ **Commit-Message-Patterns** - Was wurde gemacht

### **Via Mistral API (geplant):**
- 🔄 **Todo-Kategorisierung** - Später mit LLM analysieren
- 🔄 **Pattern-Recognition** - Später mit LLM erkennen
- 🔄 **Recommendation-System** - Später mit LLM lernen

## 📈 **Spätere Analysen:**

### **Mit LLMs auf Rohdaten:**
- **Alignment-Analyse** - Geld vs. Tool vs. Marketing Fokus
- **Triage-Pattern-Recognition** - Wie entscheidet User?
- **Optimization-Suggestions** - Was kann verbessert werden?
- **Predictive-Modeling** - Was wird wahrscheinlich verschoben?

## 🎯 **Vorteile:**
- **Rohdaten sammeln** - Ohne Interpretation
- **Später analysieren** - Mit besseren LLMs
- **Lernen aus Patterns** - User-Verhalten verstehen
- **Empfehlungen geben** - Basierend auf echten Daten

---

**"Track first, analyze later" - Das ist der richtige Ansatz!**
