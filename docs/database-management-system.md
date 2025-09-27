# 🗄️ Lokales Datenbank-Management System

## Übersicht

Das lokale Datenbank-Management System ermöglicht es, Markdown-Dateien als Single Source of Truth zu verwenden und gleichzeitig strukturierte JSON-Daten für die Web-Anwendung zu generieren. Das System bietet bidirektionale Synchronisation und automatische Updates.

## 🏗️ Architektur

### Komponenten

1. **Markdown-Parser** (`scripts/markdown-parser.js`)
   - Parst Markdown-Dateien und extrahiert strukturierte Task-Daten
   - Generiert JSON-Datenbank mit semantischen Metadaten
   - Unterstützt verschiedene Task-Formate und Prioritäten

2. **Auto-Sync Service** (`scripts/auto-sync.js`)
   - Überwacht Markdown-Dateien auf Änderungen
   - Automatische Synchronisation bei Datei-Updates
   - Protokolliert alle Sync-Aktivitäten

3. **Database API** (`scripts/database-api.js`)
   - REST-API für Datenbank-Management
   - Bidirektionale Synchronisation
   - CRUD-Operationen für Tasks

4. **Management Dashboard** (`web/database-management.html`)
   - Web-Interface für Datenbank-Verwaltung
   - Echtzeit-Statistiken und Sync-Status
   - Manuelle Sync-Kontrollen

5. **Haupt-Dashboard** (`web/index.html`)
   - Moderne Web-Anwendung mit Google Material 3 Design
   - Lädt Daten aus der JSON-Datenbank
   - Responsive Design für alle Geräte

## 🚀 Installation und Start

### Voraussetzungen

- Node.js (Version 14 oder höher)
- npm
- Bash-Shell (für Start-Scripts)

### Installation

```bash
# Dependencies installieren
npm install express

# Start-Script ausführbar machen
chmod +x start-database-system.sh

# System starten
./start-database-system.sh
```

### Manueller Start

```bash
# 1. Initiale Synchronisation
node scripts/markdown-parser.js

# 2. Auto-Sync Service starten
node scripts/auto-sync.js start

# 3. Database API starten
node scripts/database-api.js 3001
```

## 📊 Datenstruktur

### Task-Objekt

```json
{
  "id": "task_2025-09-30____monatssequenz___8",
  "title": "**📅 Monatssequenz**",
  "description": "Oktober-Planung und Ziele definieren",
  "status": "pending",
  "priority": "medium",
  "tags": ["planning"],
  "date": "2025-09-30",
  "week": null,
  "project": "TIMELINE: Oktober - Dezember 2025",
  "line_number": 8,
  "created_at": "2025-09-27T09:47:41.519Z",
  "updated_at": "2025-09-27T09:47:41.519Z",
  "source_file": "./core/Dashboard - Strukturierte To-do-Übersicht.md",
  "subtasks": []
}
```

### Datenbank-Schema

- **tasks.json**: Hauptdatenbank mit allen Tasks
- **sync-log.json**: Protokoll aller Synchronisationen
- **tracking-data.json**: Tracking-Daten (falls vorhanden)

## 🔄 Synchronisation

### Automatische Synchronisation

Das Auto-Sync Service überwacht folgende Dateien:
- `./core/Dashboard - Strukturierte To-do-Übersicht.md`
- `./core/right-sidebar.md`

Bei Änderungen wird automatisch:
1. Markdown zu JSON geparst
2. Datenbank aktualisiert
3. Website neu geladen
4. Sync-Log aktualisiert

### Manuelle Synchronisation

Über das Management Dashboard:
- **Markdown → JSON**: Aktualisiert Datenbank aus Markdown
- **JSON → Markdown**: Generiert Markdown aus Datenbank
- **Bidirektional**: Intelligente Synchronisation in beide Richtungen

## 🌐 Web-Interface

### URLs

- **Management Dashboard**: http://localhost:3001/database-management.html
- **Haupt-Dashboard**: http://localhost:3001/index.html
- **API Health Check**: http://localhost:3001/api/health

### Features

#### Management Dashboard
- System-Status und Health Check
- Echtzeit-Statistiken
- Sync-Kontrollen
- Log-Anzeige
- Schnellaktionen

#### Haupt-Dashboard
- Moderne Google Material 3 Design
- Responsive Layout
- Task-Filterung nach Datum und Priorität
- Echtzeit-Daten aus JSON-Datenbank

## 🔧 API-Endpoints

### Task-Management

- `GET /api/tasks` - Alle Tasks abrufen
- `GET /api/tasks/:id` - Einzelnen Task abrufen
- `PUT /api/tasks/:id` - Task aktualisieren
- `POST /api/tasks` - Neuen Task erstellen
- `DELETE /api/tasks/:id` - Task löschen

### Synchronisation

- `POST /api/sync/markdown-to-json` - Markdown zu JSON
- `POST /api/sync/json-to-markdown` - JSON zu Markdown
- `POST /api/sync/bidirectional` - Bidirektionale Sync

### Statistiken

- `GET /api/stats` - Datenbank-Statistiken
- `GET /api/logs` - Sync-Logs
- `GET /api/health` - Health Check

## 📝 Verwendung

### Markdown als Single Source of Truth

1. Bearbeiten Sie die Markdown-Dateien in `./core/`
2. Das Auto-Sync Service erkennt Änderungen automatisch
3. JSON-Datenbank wird aktualisiert
4. Website zeigt neue Daten an

### Web-Interface als primäre Quelle

1. Verwenden Sie das Management Dashboard
2. Bearbeiten Sie Tasks über die Web-Interface
3. Synchronisieren Sie zurück zu Markdown
4. Markdown-Dateien werden aktualisiert

## 🛠️ Entwicklung

### Scripts

- `start-database-system.sh` - Startet alle Services
- `scripts/markdown-parser.js` - Markdown-Parser
- `scripts/auto-sync.js` - Auto-Sync Service
- `scripts/database-api.js` - Database API
- `scripts/markdown-generator.js` - Markdown-Generator

### Konfiguration

Alle Konfigurationen sind in den Script-Dateien enthalten. Hauptparameter:

- **Port**: 3001 (Database API)
- **Watch-Pfade**: `./core/` Verzeichnis
- **Datenbank-Pfad**: `./data/tasks.json`

## 🔍 Troubleshooting

### Häufige Probleme

1. **API nicht erreichbar**
   - Prüfen Sie ob Port 3001 frei ist
   - Starten Sie die Database API neu

2. **Auto-Sync funktioniert nicht**
   - Prüfen Sie die Dateiberechtigungen
   - Starten Sie den Auto-Sync Service neu

3. **Markdown wird nicht geparst**
   - Prüfen Sie die Markdown-Syntax
   - Verwenden Sie den Markdown-Parser manuell

### Logs

- **Sync-Logs**: `./data/sync-log.json`
- **Console-Output**: Terminal-Ausgabe der Services
- **Browser-Console**: Web-Interface Debug-Informationen

## 🚀 Nächste Schritte

1. **Migration zu Web-as-Source-of-Truth**
   - Erweiterte Web-Interface-Features
   - Real-time Collaboration
   - Offline-Support

2. **Erweiterte Features**
   - Task-Dependencies
   - Zeit-Tracking
   - Export/Import-Funktionen

3. **Integration**
   - Git-Integration
   - CI/CD-Pipeline
   - Cloud-Sync

## 📄 Lizenz

Dieses System ist Teil des lokalen To-do-Management-Projekts und unterliegt den gleichen Lizenzbedingungen.
