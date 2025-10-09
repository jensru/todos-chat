# 🚀 Todo-App - Next.js + Mistral AI Integration

## 📋 Projektübersicht

Eine moderne, professionelle Todo-App mit KI-Integration, entwickelt mit Next.js 15, TypeScript, Shadcn/ui und Mistral AI. Die App bietet erweiterte Task-Management-Funktionen mit intelligenter KI-Unterstützung.

> 📖 **Detaillierte Architektur-Dokumentation**: Siehe [ARCHITECTURE.md](ARCHITECTURE.md) für vollständige technische Details, APIs und Best Practices.

## 🏗️ Technologie-Stack

### Frontend
- **Next.js 15** - React Framework mit App Router
- **TypeScript** - Typsichere Entwicklung
- **Tailwind CSS** - Utility-first CSS Framework
- **Shadcn/ui** - Moderne UI-Komponenten
- **Lucide React** - Icon-Bibliothek

### Backend & KI
- **Mistral AI** - KI-Integration für intelligente Antworten
- **Next.js API Routes** - Serverless Backend
- **Prisma ORM** - Type-safe Datenbankzugriff
- **SQLite** - Lokale relationale Datenbank

### Entwicklung
- **ESLint** - Code-Qualität und Konsistenz
- **Prettier** - Code-Formatierung
- **Turbopack** - Schnelle Entwicklung

## 🎯 Hauptfunktionen

### Task-Management
- ✅ **Task-Erstellung** mit Titel, Beschreibung und Kategorien
- 📅 **Datumsbasierte Sortierung** (Heute, Morgen, Ohne Datum)
- ⭐ **Prioritäts-System** mit visuellen Indikatoren
- 📁 **Kategorie-Management** mit benutzerdefinierten Kategorien
- 🔄 **Drag & Drop** mit Float Position System (O(1) Komplexität, state-of-the-art)
- ✅ **Erledigte Tasks** werden automatisch ausgeblendet
- 💾 **SQLite Datenbank** mit Prisma ORM für robuste Persistierung

### KI-Integration
- 🤖 **Mistral AI Chat** für intelligente Unterhaltungen
- 💡 **Task-Vorschläge** basierend auf Benutzereingaben
- 🔧 **Aufgaben-Zerlegung** in Unteraufgaben
- 🎯 **Kontextbewusste Antworten** mit Task-Informationen

### Benutzeroberfläche
- 🎨 **Moderne UI** mit Shadcn/ui Komponenten
- 📱 **Responsive Design** für alle Geräte
- 🌙 **Dark/Light Mode** Unterstützung
- ⚡ **Schnelle Performance** mit Next.js 15

## 📁 Projektstruktur

Die App folgt einer modularen Enterprise-Architektur mit klarer Trennung von Verantwortlichkeiten:

- **Frontend**: Next.js 15 + TypeScript + Shadcn/ui
- **Backend**: Next.js API Routes + Prisma ORM + SQLite
- **KI-Integration**: Mistral AI für intelligente Chat-Funktionen
- **Drag & Drop**: Float Position System (O(1) Komplexität)

> 📖 **Detaillierte Architektur**: Siehe [ARCHITECTURE.md](ARCHITECTURE.md) für vollständige Projektstruktur und technische Details.

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn

### Installation
```bash
# Repository klonen
git clone <repository-url>
cd todo-app-nextjs

# Abhängigkeiten installieren
npm install

# Mistral API Key konfigurieren
echo "NEXT_PUBLIC_MISTRAL_API_KEY=your_api_key_here" > .env.local

# Entwicklungsserver starten
npm run dev
```

### Mistral API Key
1. Gehe zu [Mistral AI](https://console.mistral.ai/)
2. Erstelle einen API Key
3. Füge ihn in `.env.local` hinzu:
   ```
   NEXT_PUBLIC_MISTRAL_API_KEY=your_api_key_here
   ```

## 📊 Datenbank

Die App verwendet eine **SQLite-Datenbank** mit **Prisma ORM** für robuste Datenverwaltung:

- **73 Tasks** erfolgreich migriert und getestet
- **Float Position System** für O(1) Drag & Drop Performance
- **Type-safe** Datenbankzugriff mit Prisma

> 📖 **Datenbank-Details**: Siehe [ARCHITECTURE.md](ARCHITECTURE.md) für Schema, Commands und Migration-Tools.

## 🔧 Entwicklung

### Code-Qualität
- **ESLint** für Code-Konsistenz
- **Prettier** für Formatierung
- **TypeScript** für Typsicherheit

### Verfügbare Scripts
```bash
# Development
npm run dev          # Entwicklungsserver mit Turbopack
npm run build        # Produktions-Build
npm run start        # Produktions-Server
npm run lint         # ESLint prüfen
npm run lint:fix     # ESLint automatisch reparieren

# Database
npx prisma studio    # Visual Database Editor
node scripts/normalize-positions.js  # Normalize positions
node scripts/migrate-from-json.js    # Migrate from JSON
```

## 🤖 KI-Integration

### Mistral AI Features
- **Chat-Funktionalität** für Unterhaltungen
- **Task-Vorschläge** basierend auf Eingaben
- **Aufgaben-Zerlegung** in Unteraufgaben
- **Kontextbewusste Antworten** mit Task-Informationen

### API-Endpunkte
- `POST /api/mistral` - Mistral AI Chat
- Rate Limit Handling für 429-Fehler
- Fehlerbehandlung mit benutzerfreundlichen Nachrichten

## 📈 Performance

Die App ist für hohe Performance optimiert:

- **O(1) Drag & Drop** - Nur ein Task wird pro Drag aktualisiert (73x schneller)
- **Next.js 15** mit Turbopack für schnelle Entwicklung
- **Type-safe** Datenbankzugriff mit Prisma ORM
- **Optimierte Komponenten** mit React Best Practices

> 📖 **Performance-Details**: Siehe [ARCHITECTURE.md](ARCHITECTURE.md) für detaillierte Metriken und Optimierungen.

## 🔒 Sicherheit

### API-Sicherheit
- **API Key** in Umgebungsvariablen
- **Rate Limiting** für Mistral API
- **Fehlerbehandlung** ohne sensible Daten

### Daten-Sicherheit
- **Lokale Speicherung** ohne externe Abhängigkeiten
- **JSON-Validierung** für Datenintegrität
- **Backup-System** für wichtige Daten

## 🚀 Deployment

### Vercel (Empfohlen)
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment
vercel

# Umgebungsvariablen setzen
vercel env add NEXT_PUBLIC_MISTRAL_API_KEY
```

### Andere Plattformen
- **Netlify** - Static Site Generation
- **Railway** - Full-stack Deployment
- **Docker** - Container-basiert

## 📝 Aktueller Status

**Version 4.0** - Production Ready mit Enterprise-Architektur:

- ✅ **SQLite Migration** - JSON → Prisma ORM + SQLite
- ✅ **Float Position System** - O(1) Drag & Drop (state-of-the-art)
- ✅ **Enterprise Refactoring** - Modulare Komponenten + Custom Hooks
- ✅ **73 Tasks migriert** - Alle Daten erfolgreich übertragen
- ✅ **0 ESLint Errors** - Production-ready Code-Qualität

> 📖 **Vollständiger Changelog**: Siehe [ARCHITECTURE.md](ARCHITECTURE.md) für detaillierte Versionshistorie.

## 🤝 Beitragen

### Entwicklung
1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Erstelle einen Pull Request

### Code-Standards
- **TypeScript** für alle neuen Dateien
- **ESLint** Regeln befolgen
- **Prettier** für Formatierung
- **Kommentare** für komplexe Logik

## 📞 Support

### Häufige Probleme
- **Mistral Rate Limit**: Warte 1-2 Minuten zwischen Anfragen
- **Tasks nicht sichtbar**: Prüfe Browser-Konsole auf Fehler
- **API Key Fehler**: Überprüfe `.env.local` Datei

### Debugging
- **Browser-Konsole** für Client-seitige Fehler
- **Terminal-Logs** für Server-seitige Probleme
- **Network-Tab** für API-Anfragen

## 📄 Lizenz

MIT License - Siehe LICENSE Datei für Details.

---

## 📚 Dokumentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Vollständige technische Architektur-Dokumentation
- **[README.md](README.md)** - Projekt-Übersicht und Quick Start

---

**Entwickelt mit ❤️ und modernen Web-Technologien**
