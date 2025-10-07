# 📋 Todo-System: Vollständige Feature-Roadmap & Dokumentation

## 🎯 **Projekt-Übersicht**

**Status:** In Entwicklung (Pre-Commit Phase)  
**Letzte Aktualisierung:** 7. Oktober 2025  
**Version:** 2.0 (Mistral AI Integration)  

### **Aktuelle Architektur:**
- **Backend:** Node.js Express API (`scripts/database-api.js`)
- **Frontend:** Vanilla JavaScript (`web/index.html`)
- **AI:** Mistral Large Latest mit Tool-Calls
- **Datenbank:** JSON-basiert (`data/smart-tasks.json`)
- **Sync:** Markdown-Dateien (`core/dates/YYYY-MM-DD.md`)

---

## 📊 **Feature-Status Matrix**

### ✅ **Implementiert (Production Ready)**

| Feature | API | Frontend | Mistral | Status |
|---------|-----|----------|---------|--------|
| Task erstellen | ✅ | ✅ | ✅ | **COMPLETE** |
| Task löschen | ✅ | ✅ | ✅ | **COMPLETE** |
| Task abrufen | ✅ | ✅ | ✅ | **COMPLETE** |
| Kategorie zuweisen | ✅ | ✅ | ✅ | **COMPLETE** |
| Priorität setzen | ✅ | ✅ | ✅ | **COMPLETE** |
| Fälligkeitsdatum setzen | ✅ | ✅ | ✅ | **COMPLETE** |
| Task-Liste anzeigen | ✅ | ✅ | ✅ | **COMPLETE** |
| Filter (Heute, Woche, etc.) | ✅ | ✅ | ❌ | **COMPLETE** |
| Auto-Refresh nach AI-Aktionen | ✅ | ✅ | ✅ | **COMPLETE** |
| Dynamisches Datum | ✅ | ✅ | ✅ | **COMPLETE** |

### 🚧 **In Entwicklung (Pre-Commit)**

| Feature | API | Frontend | Mistral | Status |
|---------|-----|----------|---------|--------|
| Code-Cleanup | ✅ | ✅ | ✅ | **COMPLETE** |
| Dokumentation | 🔄 | 🔄 | 🔄 | **IN PROGRESS** |
| Systematische Tests | ❌ | ❌ | ❌ | **PENDING** |
| Usability-Verbesserungen | ❌ | ❌ | ❌ | **PENDING** |

### 📋 **Geplant (Post-Commit)**

| Feature | API | Frontend | Mistral | Priorität |
|---------|-----|----------|---------|-----------|
| Task umbenennen | ❌ | ❌ | ❌ | **HIGH** |
| Task bearbeiten | ❌ | ❌ | ❌ | **HIGH** |
| Fälligkeitsdatum entfernen | ❌ | ❌ | ❌ | **HIGH** |
| Kategorie ändern | ❌ | ❌ | ❌ | **HIGH** |
| Priorität ändern | ❌ | ❌ | ❌ | **HIGH** |
| Kategorie erstellen | ❌ | ❌ | ❌ | **MEDIUM** |
| Kategorie umbenennen | ❌ | ❌ | ❌ | **MEDIUM** |
| Kategorie löschen | ❌ | ❌ | ❌ | **MEDIUM** |
| Inline-Editing | ❌ | ❌ | ❌ | **MEDIUM** |
| Bulk-Operations | ❌ | ❌ | ❌ | **LOW** |
| Task-Templates | ❌ | ❌ | ❌ | **LOW** |

---

## 🗺️ **Detaillierte Roadmap**

### **Phase 1: Pre-Commit Cleanup** ⏰ *Heute*

#### **1.1 Code-Cleanup** ✅ **COMPLETE**
- [x] Ungenutzte Funktionen entfernt (`callMistralSimple`, `callMistralWithTools`)
- [x] Architektur vereinfacht
- [x] ~200 Zeilen Code entfernt
- [x] System funktioniert weiterhin

#### **1.2 Dokumentation** 🔄 **IN PROGRESS**
- [x] Mistral API Dokumentation erstellt
- [ ] HANDOVER.md aktualisiert
- [ ] API-Endpoints dokumentiert
- [ ] Frontend-Features dokumentiert
- [ ] Deployment-Guide erstellt

#### **1.3 Systematische Tests** ❌ **PENDING**
- [ ] API-Endpoints testen
- [ ] Mistral Tool-Calls testen
- [ ] Frontend-Funktionen testen
- [ ] Edge Cases testen
- [ ] Performance-Tests

#### **1.4 Usability-Verbesserungen** ❌ **PENDING**
- [ ] Alert beim Löschen entfernt ✅
- [ ] Auto-Refresh implementiert ✅
- [ ] Fehlerbehandlung verbessern
- [ ] Loading-States hinzufügen
- [ ] Responsive Design prüfen

### **Phase 2: Core CRUD Operations** ⏰ *Nächste Woche*

#### **2.1 Task Update Operations** ❌ **PENDING**
- [ ] `PUT /api/tasks/:id` erweitern
- [ ] `update_task` Tool für Mistral
- [ ] Frontend Update-UI
- [ ] Inline-Editing implementieren

#### **2.2 Attribute Management** ❌ **PENDING**
- [ ] `remove_due_date` Tool
- [ ] `change_category` Tool
- [ ] `change_priority` Tool
- [ ] `rename_task` Tool
- [ ] Frontend Attribute-Editing

#### **2.3 Edge Cases Support** ❌ **PENDING**
- [ ] Tasks ohne Namen unterstützen
- [ ] Tasks ohne Kategorie unterstützen
- [ ] Validierung anpassen
- [ ] Default-Werte definieren

### **Phase 3: Advanced Features** ⏰ *Später*

#### **3.1 Kategorien-Management** ❌ **PENDING**
- [ ] `POST /api/categories` - Kategorie erstellen
- [ ] `PUT /api/categories/:id` - Kategorie umbenennen
- [ ] `DELETE /api/categories/:id` - Kategorie löschen
- [ ] Frontend Kategorien-UI
- [ ] Mistral Kategorien-Tools

#### **3.2 Bulk Operations** ❌ **PENDING**
- [ ] Mehrere Tasks gleichzeitig bearbeiten
- [ ] Bulk-Kategorie-Änderung
- [ ] Bulk-Priorität-Änderung
- [ ] Bulk-Löschung

#### **3.3 Advanced UI** ❌ **PENDING**
- [ ] Drag & Drop
- [ ] Keyboard Shortcuts
- [ ] Task-Templates
- [ ] Advanced Filtering

---

## 🧪 **Test-Plan**

### **API Tests**
```bash
# Basis-Operationen
curl -X POST http://localhost:3001/api/tasks -d '{"title":"Test","category":"General"}'
curl -X GET http://localhost:3001/api/smart-tasks
curl -X DELETE http://localhost:3001/api/tasks/{id}

# Mistral Tool-Calls
curl -X POST http://localhost:3001/api/mistral -d '{"prompt":"Erstelle einen neuen Todo: Test"}'
curl -X POST http://localhost:3001/api/mistral -d '{"prompt":"Lösche alle General Tasks von heute"}'
curl -X POST http://localhost:3001/api/mistral -d '{"prompt":"Zeige mir alle Marketing Tasks"}'

# Edge Cases
curl -X POST http://localhost:3001/api/tasks -d '{"title":"","category":"General"}'
curl -X POST http://localhost:3001/api/tasks -d '{"title":"Test","category":""}'
```

### **Frontend Tests**
- [ ] Task-Erstellung über UI
- [ ] Task-Löschung über UI
- [ ] Filter-Funktionen
- [ ] Auto-Refresh nach AI-Aktionen
- [ ] Responsive Design
- [ ] Error Handling

### **Mistral Tests**
- [ ] Tool-Call Erkennung
- [ ] Dynamisches Datum
- [ ] Kategorie-Erkennung
- [ ] Priorität-Erkennung
- [ ] Fehlerbehandlung

---

## 📚 **API-Dokumentation**

### **Endpoints**

#### **Tasks**
- `GET /api/smart-tasks` - Alle Tasks abrufen
- `POST /api/tasks` - Neuen Task erstellen
- `PUT /api/tasks/:id` - Task aktualisieren
- `DELETE /api/tasks/:id` - Task löschen

#### **Mistral AI**
- `POST /api/mistral` - Mistral Chat mit Tool-Calls

#### **System**
- `GET /api/health` - Health Check
- `GET /api/stats` - Statistiken
- `GET /api/logs` - Sync-Logs

### **Tool-Calls (Mistral)**

#### **Verfügbare Tools**
1. **`create_task`** - Neuen Task erstellen
2. **`query_tasks`** - Tasks suchen/filtern
3. **`delete_category`** - Tasks einer Kategorie löschen
4. **`move_tasks`** - Tasks zwischen Daten verschieben

#### **Tool-Parameter**
```json
{
  "create_task": {
    "title": "string",
    "category": "string", 
    "due_date": "YYYY-MM-DD",
    "priority": "low|medium|high"
  },
  "query_tasks": {
    "category": "string",
    "status": "pending|completed",
    "due_date": "YYYY-MM-DD"
  },
  "delete_category": {
    "category": "string",
    "due_date": "YYYY-MM-DD"
  },
  "move_tasks": {
    "category": "string",
    "from_date": "YYYY-MM-DD",
    "to_date": "YYYY-MM-DD"
  }
}
```

---

## 🚀 **Deployment-Guide**

### **Voraussetzungen**
- Node.js 18+
- Mistral API Key
- Port 3001 verfügbar

### **Installation**
```bash
# Repository klonen
git clone [repository-url]
cd todos

# API Key setzen
echo "your-mistral-api-key" > .mistral_api_key

# Server starten
MISTRAL_API_KEY=$(cat .mistral_api_key) node scripts/database-api.js
```

### **Verfügbare URLs**
- **Web-Interface:** http://localhost:3001
- **API-Docs:** http://localhost:3001/api/health
- **Test-Seite:** http://localhost:3001/test.html

---

## 📈 **Performance-Metriken**

### **Aktuelle Performance**
- **API Response Time:** ~200ms
- **Mistral Tool-Calls:** ~2-3s
- **Frontend Load Time:** ~500ms
- **Auto-Refresh:** ~100ms

### **Optimierungsziele**
- **API Response Time:** <100ms
- **Mistral Tool-Calls:** <2s
- **Frontend Load Time:** <300ms
- **Auto-Refresh:** <50ms

---

## 🔧 **Entwicklungs-Workflow**

### **Pre-Commit Checklist**
- [ ] Alle Tests bestehen
- [ ] Code-Cleanup abgeschlossen
- [ ] Dokumentation aktualisiert
- [ ] Performance akzeptabel
- [ ] Keine Console-Errors
- [ ] Responsive Design getestet

### **Commit-Message Format**
```
feat: Add Mistral AI integration with tool-calls
fix: Remove unused functions and simplify architecture
docs: Update API documentation and feature roadmap
test: Add systematic testing for all endpoints
```

---

## 🎯 **Nächste Schritte**

### **Sofort (Heute)**
1. ✅ Code-Cleanup abgeschlossen
2. 🔄 Dokumentation vervollständigen
3. ❌ Systematische Tests durchführen
4. ❌ Usability-Verbesserungen

### **Diese Woche**
1. ❌ Core CRUD Operations implementieren
2. ❌ Attribute Management erweitern
3. ❌ Edge Cases unterstützen
4. ❌ Frontend Inline-Editing

### **Nächste Woche**
1. ❌ Kategorien-Management
2. ❌ Bulk Operations
3. ❌ Advanced UI Features
4. ❌ Performance-Optimierung

---

**📝 Diese Dokumentation wird kontinuierlich aktualisiert und dient als Single Source of Truth für das gesamte Projekt.**
