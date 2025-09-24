# 🤖 Mistral API Integration

## 📋 **Übersicht**
Automatische Interpretationen deiner Chat-First Research Daten mit Mistral API.

## 🚀 **Setup**

### **1. API Key einrichten:**
```bash
./setup-mistral-api.sh
```

### **2. API Key manuell setzen:**
```bash
# Option 1: Umgebungsvariable
export MISTRAL_API_KEY="dein_key_hier"

# Option 2: Datei erstellen
echo "dein_key_hier" > .mistral_api_key
chmod 600 .mistral_api_key
```

## 📊 **Verwendung**

### **Alignment-Dashboard mit Mistral:**
```bash
./alignment-dashboard.sh --mistral
```
**Output:**
- Raw Data (wie bisher)
- + Mistral Interpretation und Empfehlungen

### **Commit mit Mistral-Analyse:**
```bash
./commit-and-update.sh "Nachricht" --mistral
```
**Output:**
- Normale Dokumentation
- + Mistral Analyse der Änderungen

### **Direkte Mistral API Calls:**
```bash
./mistral-api.sh "Analysiere meine Todo-Verteilung: 40% Tool, 30% Marketing, 20% Geld"
```

## 🎯 **Workflow-Optionen**

### **Option 1: Nur Terminal (wie bisher)**
```bash
./alignment-dashboard.sh
# Dann hier im Chat interpretieren
```

### **Option 2: Terminal + Mistral**
```bash
./alignment-dashboard.sh --mistral
# Automatische Interpretationen
```

### **Option 3: Hybrid**
```bash
./alignment-dashboard.sh --mistral  # Schnelle Analyse
# Dann hier im Chat für komplexe Strategien
```

## 💰 **Kosten**
- **Mistral Free Tier**: 1000 Requests/Monat
- **Kostenlos** für dein Use Case
- **Keine lokalen Ressourcen** nötig

## 🔧 **Troubleshooting**

### **API Key Fehler:**
```bash
./setup-mistral-api.sh  # Neu einrichten
```

### **Python Fehler:**
```bash
# Python3 installieren falls nötig
brew install python3
```

### **Curl Fehler:**
```bash
# Curl testen
curl -I https://api.mistral.ai
```

## 📈 **Nächste Schritte**
1. **Setup**: `./setup-mistral-api.sh`
2. **Test**: `./alignment-dashboard.sh --mistral`
3. **Integration**: In deinen Workflow einbauen
4. **Optimierung**: Prompts anpassen für bessere Ergebnisse
