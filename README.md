# 🎯 Todo-App - Professionelle Next.js + Mistral AI Integration

Eine moderne, professionelle Todo-App mit KI-Integration, gebaut mit Next.js 15, Shadcn/ui und Mistral AI.

## ✨ Features

### 🤖 AI-Integration
- **Mistral-Large Chat** - Intelligente Gespräche mit KI
- **Task-Vorschläge** - Automatische Aufgaben-Generierung
- **Aufgaben-Aufschlüsselung** - Komplexe Tasks in Unteraufgaben zerlegen
- **Kontextuelle Antworten** - KI versteht deine Aufgaben und Ziele

### 📋 Task-Management
- **Drag & Drop** zwischen Tagen
- **Priority-System** mit Star-Icons
- **Kategorie-Management** für bessere Organisation
- **Unteraufgaben** für detaillierte Planung
- **Datum-Sortierung** mit intelligenter Gruppierung
- **Real-time Updates** mit LocalStorage-Sync

### 🎨 UI/UX
- **Shadcn/ui Komponenten** - Professionelle, konsistente UI
- **Lucide React Icons** - Moderne, klare Ikonografie
- **Dark/Light Theme** - Automatische Theme-Erkennung
- **Mobile-responsive** - Optimiert für alle Geräte
- **Chat + Canvas Layout** - Getrennte Bereiche für Kommunikation und Aufgaben

## 🚀 Technologie-Stack

- **Next.js 15** - React Framework mit App Router
- **TypeScript** - Typsichere Entwicklung
- **Shadcn/ui** - Moderne UI-Komponenten
- **Tailwind CSS** - Utility-first CSS Framework
- **Mistral AI** - Large Language Model Integration
- **Lucide React** - Icon Library
- **LocalStorage** - Client-side Datenpersistierung

## 📁 Projekt-Struktur

```
todo-app-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Haupt-App
│   │   └── globals.css           # Shadcn Styles
│   ├── components/
│   │   ├── ui/                   # Shadcn UI Komponenten
│   │   └── TaskCard.tsx          # Task-Komponente
│   ├── lib/
│   │   ├── types.ts              # TypeScript Interfaces
│   │   └── services/
│   │       ├── TaskService.ts    # Datenbank-Service
│   │       └── MistralService.ts # AI-Integration
│   └── utils.ts                  # Shadcn Utils
├── public/
│   └── data/
│       ├── smart-tasks.json      # Haupt-Datenbank
│       └── tasks.json            # Backup-Datenbank
├── components.json               # Shadcn Config
├── package.json                  # Dependencies
└── README.md                     # Diese Dokumentation
```

## 🛠️ Installation & Setup

### 1. Dependencies installieren
```bash
cd todo-app-nextjs
npm install
```

### 2. Mistral API Key konfigurieren
Erstelle eine `.env.local` Datei:
```bash
NEXT_PUBLIC_MISTRAL_API_KEY=dein_mistral_api_key_hier
```

### 3. Entwicklungsserver starten
```bash
npm run dev
```

Die App ist dann unter `http://localhost:3000` verfügbar.

## 🎯 Verwendung

### Chat mit KI
- Schreibe Nachrichten im Chat-Panel
- Drücke Enter oder klicke "Send"
- Die KI antwortet kontextuell basierend auf deinen Aufgaben

### Aufgaben verwalten
- **Neue Aufgabe**: Klicke "Neue Aufgabe" oder frage die KI
- **Priorität setzen**: Klicke auf das Star-Icon
- **Als erledigt markieren**: Klicke auf das Checkbox-Icon
- **Bearbeiten**: Klicke auf die Aufgabe zum Bearbeiten
- **Löschen**: Klicke auf das Trash-Icon

### Drag & Drop
- Ziehe Aufgaben zwischen verschiedenen Tagen
- Die Position wird automatisch gespeichert

## 🔧 Entwicklung

### Code-Qualität
- **TypeScript** für alle Dateien
- **Modulare Komponenten** mit einer Verantwortung
- **Error Boundaries** für Fehlerbehandlung
- **Comprehensive Logging** für Debugging

### Architektur-Prinzipien
- **Clean Code** - Lesbarer, wartbarer Code
- **Separation of Concerns** - Klare Trennung der Verantwortlichkeiten
- **DRY Principle** - Keine Code-Duplikation
- **SOLID Principles** - Objektorientierte Design-Prinzipien

## 📊 Daten-Management

### JSON-Datenbank
- **smart-tasks.json** - Haupt-Datenbank mit allen Aufgaben
- **tasks.json** - Backup-Datenbank
- **LocalStorage** - Client-side Änderungen werden lokal gespeichert

### Daten-Synchronisation
- Beim Laden werden JSON-Dateien als Basis verwendet
- LocalStorage-Änderungen werden darüber gelegt
- Automatische Merge-Logik für Konflikte

## 🚀 Deployment

### Build für Produktion
```bash
npm run build
npm start
```

### Umgebungsvariablen
Stelle sicher, dass `NEXT_PUBLIC_MISTRAL_API_KEY` in der Produktionsumgebung gesetzt ist.

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📝 Lizenz

MIT License - siehe LICENSE Datei für Details.

---

**Entwickelt mit ❤️ für produktive Aufgabenverwaltung mit KI-Unterstützung**
