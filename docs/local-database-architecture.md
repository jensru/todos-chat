# 🗄️ Lokale Datenbank-Architektur mit Markdown-Sync

## 🎯 Konzept: Markdown-First mit strukturierter Datenbank

### **Single Source of Truth Evolution:**
1. **Phase 1**: Markdown → JSON-DB (aktuell)
2. **Phase 2**: Bidirektionale Sync (Markdown ↔ DB)
3. **Phase 3**: Web-Interface als primäre Quelle (optional)

## 🏗️ Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                    MARKDOWN FILES                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Dashboard.md    │  │ Sidebar.md      │  │ Tasks.md    │ │
│  │ (Single Source) │  │ (Context)       │  │ (History)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 MARKDOWN PARSER                             │
│  • Task-Extraktion                                          │
│  • Datum-Parsing                                            │
│  • Priorität-Erkennung                                      │
│  • Status-Tracking                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                JSON DATABASE                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ tasks.json      │  │ projects.json   │  │ history.json│ │
│  │ (Strukturierte  │  │ (Kontext)       │  │ (Tracking)  │ │
│  │  Task-Daten)    │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 WEB INTERFACE                               │
│  • Dashboard mit DB-Daten                                   │
│  • Interaktive Task-Verwaltung                               │
│  • Automatische Markdown-Updates                             │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Datenmodell

### **Task-Struktur (JSON)**
```json
{
  "id": "task_2025_09_26_push_finish",
  "title": "🔥 PUSH fertig",
  "description": "Alle PUSH Content-Todos abschließen",
  "status": "pending",
  "priority": "high",
  "date": "2025-09-26",
  "week": "KW 39",
  "category": "work",
  "subtasks": [
    {
      "id": "subtask_1",
      "title": "letzten Präse Steps inhaltlich",
      "status": "pending"
    }
  ],
  "tags": ["PUSH", "Präsentation", "Content"],
  "created": "2025-09-26T10:00:00Z",
  "updated": "2025-09-26T10:00:00Z",
  "markdown_source": "core/Dashboard - Strukturierte To-do-Übersicht.md",
  "markdown_line": 8
}
```

### **Projekt-Struktur (JSON)**
```json
{
  "id": "project_push_2025",
  "name": "PUSH Vorbereitung",
  "description": "Vorbereitung für PUSH Konferenz",
  "status": "active",
  "start_date": "2025-09-01",
  "end_date": "2025-09-30",
  "tasks": ["task_2025_09_26_push_finish"],
  "progress": 75,
  "tags": ["Konferenz", "Präsentation"]
}
```

## 🔄 Sync-Mechanismus

### **Markdown → JSON (Parsing)**
1. **Task-Extraktion**: Regex-Pattern für `- [ ]` und `- [x]`
2. **Datum-Parsing**: Erkennung von Datumsformaten
3. **Hierarchie**: Subtasks durch Einrückung
4. **Metadaten**: Emojis, Prioritäten, Tags

### **JSON → Markdown (Rendering)**
1. **Template-System**: Markdown-Templates für verschiedene Bereiche
2. **Sortierung**: Nach Datum, Priorität, Status
3. **Formatierung**: Konsistente Struktur
4. **Backup**: Alte Versionen werden gesichert

## 🛠️ Implementierung

### **Phase 1: Markdown-Parser**
```javascript
class MarkdownTaskParser {
  parseTasks(markdownContent) {
    const tasks = [];
    const lines = markdownContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Task-Pattern: - [ ] oder - [x]
      const taskMatch = line.match(/^- \[([ x])\] (.+)$/);
      if (taskMatch) {
        tasks.push({
          id: this.generateId(line, i),
          status: taskMatch[1] === 'x' ? 'completed' : 'pending',
          title: taskMatch[2],
          line_number: i,
          raw_line: line
        });
      }
    }
    
    return tasks;
  }
}
```

### **Phase 2: JSON-Datenbank**
```javascript
class LocalTaskDatabase {
  constructor() {
    this.tasks = this.loadFromFile('data/tasks.json');
    this.projects = this.loadFromFile('data/projects.json');
  }
  
  saveTask(task) {
    this.tasks[task.id] = task;
    this.saveToFile('data/tasks.json', this.tasks);
  }
  
  getTasksByDate(date) {
    return Object.values(this.tasks)
      .filter(task => task.date === date)
      .sort((a, b) => a.priority - b.priority);
  }
}
```

### **Phase 3: Sync-Service**
```javascript
class MarkdownSyncService {
  constructor() {
    this.parser = new MarkdownTaskParser();
    this.database = new LocalTaskDatabase();
    this.watcher = new FileWatcher();
  }
  
  async syncMarkdownToDB(markdownFile) {
    const content = await fs.readFile(markdownFile, 'utf8');
    const tasks = this.parser.parseTasks(content);
    
    for (const task of tasks) {
      this.database.saveTask(task);
    }
  }
  
  async syncDBToMarkdown(markdownFile) {
    const tasks = this.database.getAllTasks();
    const markdown = this.generateMarkdown(tasks);
    
    await fs.writeFile(markdownFile, markdown);
  }
}
```

## 📁 Dateistruktur

```
/Users/jensru/Sites/todos/
├── core/
│   ├── Dashboard - Strukturierte To-do-Übersicht.md  # Single Source
│   └── right-sidebar.md
├── data/
│   ├── tasks.json              # Strukturierte Task-Daten
│   ├── projects.json           # Projekt-Daten
│   ├── history.json            # Änderungshistorie
│   └── sync-log.json           # Sync-Protokoll
├── scripts/
│   ├── markdown-parser.js      # Markdown → JSON
│   ├── markdown-generator.js   # JSON → Markdown
│   ├── sync-service.js         # Bidirektionale Sync
│   └── db-manager.js           # Datenbank-Management
├── web/
│   ├── index.html              # Dashboard mit DB-Daten
│   └── db-interface.html       # Datenbank-Management UI
└── automation/
    ├── sync-on-change.sh        # Automatische Sync
    └── backup-markdown.sh       # Markdown-Backup
```

## 🚀 Vorteile dieser Architektur

### **Flexibilität**
- ✅ Markdown bleibt Single Source of Truth
- ✅ Strukturierte Daten für komplexe Abfragen
- ✅ Einfache Migration zu Web-as-Source später möglich

### **Performance**
- ✅ Schnelle Datenbankabfragen
- ✅ Caching von strukturierten Daten
- ✅ Optimierte Web-Darstellung

### **Erweiterbarkeit**
- ✅ Einfache Hinzufügung neuer Felder
- ✅ API für externe Tools
- ✅ Export/Import in verschiedene Formate

### **Zuverlässigkeit**
- ✅ Automatische Backups
- ✅ Sync-Protokoll für Nachverfolgung
- ✅ Rollback-Möglichkeiten

## 🔧 Nächste Schritte

1. **Markdown-Parser implementieren**
2. **JSON-Datenbank aufsetzen**
3. **Sync-Service entwickeln**
4. **Web-Interface erweitern**
5. **Automatisierung einrichten**

Diese Architektur gibt Ihnen die beste aus beiden Welten: Die Einfachheit von Markdown als Single Source of Truth und die Leistungsfähigkeit einer strukturierten Datenbank für komplexe Operationen! 🎯
