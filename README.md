# 🎯 Todo-App - Multi-User Todo-App mit KI & Auto-Save

Eine moderne, Cloud-basierte Todo-App mit Supabase-Backend, Multi-User-Support, KI-Integration und Auto-Save, gebaut mit Next.js 15, TypeScript und Mistral AI.

**Version**: 6.0.0 | **Status**: ✅ Production Ready | **Deployment**: Vercel

## ✨ Features

### 🔐 Authentication & Multi-User
- **Supabase Auth** - Sichere Email/Password Authentifizierung
- **Google OAuth** - One-Click Login mit Google
- **Multi-User Support** - Jeder User hat seine eigenen Tasks
- **Row Level Security** - Datenbank-Sicherheit auf User-Ebene

### 📋 Task-Management
- **CRUD Operations** - Erstellen, Lesen, Aktualisieren, Löschen
- **Auto-Save System** - Automatisches Speichern mit Visual Feedback
- **Drag & Drop** - Tasks zwischen Tagen verschieben
- **Priority-System** - Wichtige Tasks markieren
- **Kategorie-Management** - Tasks organisieren
- **Unteraufgaben** - Komplexe Tasks aufteilen
- **Date-based Grouping** - Automatische Sortierung nach Datum
- **Timezone-korrekt** - Lokale Datumsanzeige (keine UTC-Fehler)

### 🤖 AI-Integration
- **Mistral-Large Chat** - Intelligente Gespräche mit KI
- **Chat-History** - Persistenter Kontext über mehrere Nachrichten
- **Tool-Calling** - KI kann Tasks erstellen, verschieben, löschen (2 API Calls pro Anfrage)
- **Natural Language Processing** - "Verschiebe Task nach morgen", "Leg das todo an, man!"
- **Smart Task Detection** - Automatische Aufgaben-Generierung
- **Intelligent Filtering** - KI filtert Antworten basierend auf Fragen (z.B. "heute" → nur HEUTE-Tasks)
- **Multi-Language Support** - KI antwortet in User-Sprache
- **Rate-Limit Handling** - Automatische Retries mit exponential backoff

### 🌍 Multi-Language Support
- **UI Languages** - English (default), German, French
- **Speech Recognition** - 60+ Sprachen unterstützt
- **Persistent Settings** - User-Präferenzen gespeichert
- **Browser Locale Detection** - Automatische Spracherkennung

### 🎨 UI/UX
- **Shadcn/ui Komponenten** - Professionelle UI
- **Lucide React Icons** - Moderne Ikonografie
- **Mobile-responsive** - Funktioniert auf allen Geräten
- **Auto-Save Feedback** - "Speichere..." / "Gespeichert" Indikatoren
- **Intuitive Exit** - Check = behalten, X = verwerfen
- **Keyboard Shortcuts** - Enter = speichern, Escape = verwerfen

## 🚀 Technologie-Stack

### Frontend
- **Next.js 15** - React Framework mit App Router
- **TypeScript** - 100% Type Safety mit Strict Rules
- **Shadcn/ui** - UI Component Library
- **Tailwind CSS** - Utility-first CSS
- **@dnd-kit** - Drag & Drop System

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relationale Cloud-Datenbank
- **Supabase Auth** - Authentication & Authorization
- **@supabase/ssr** - Server-Side Rendering Support

### KI & APIs
- **Mistral AI** - Large Language Model mit Tool Execution
- **Next.js API Routes** - Serverless Functions
- **Web Speech API** - Browser-basierte Spracherkennung

### Development & Quality
- **ESLint** - Code Quality (0 Errors)
- **Husky** - Pre-commit Hooks
- **Strict TypeScript** - Enhanced Type Safety

### Deployment
- **Vercel** - Production Hosting
- **Git** - Version Control

## 🛠️ Installation & Setup

### Voraussetzungen
- Node.js 20+
- Supabase Account (kostenlos)
- Mistral API Key (optional)

### 1. Repository klonen
```bash
git clone <repository-url>
cd todo-app-nextjs
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Supabase Setup

#### 3.1 Supabase Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Warte bis Projekt bereit ist

#### 3.2 Database Schema erstellen
Führe dieses SQL in Supabase SQL Editor aus:

```sql
-- Tasks Table erstellen
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  priority BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ,
  category TEXT DEFAULT 'todo',
  tags JSONB DEFAULT '[]',
  subtasks JSONB DEFAULT '[]',
  global_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security aktivieren
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users können nur ihre eigenen Tasks sehen
CREATE POLICY "Users can only access their own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);

-- Index für Performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

#### 3.3 Authentication konfigurieren
1. Gehe zu **Authentication** → **Providers**
2. Aktiviere **Email** Provider
3. (Optional) Aktiviere **Google** Provider
4. Kopiere **Site URL**: `http://localhost:3000`

### 4. Environment Variables

Erstelle `.env.local` Datei:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mistral AI (optional)
MISTRAL_API_KEY=your_mistral_api_key
```

**API Keys finden:**
- Gehe zu **Project Settings** → **API**
- Kopiere **URL**, **anon/public key** und **service_role key**

### 5. Entwicklungsserver starten

```bash
npm run dev
```

App läuft auf: `http://localhost:3000`

## 🎯 Verwendung

### Registrierung & Login
1. Öffne die App: `http://localhost:3000`
2. Du wirst automatisch zu `/login` weitergeleitet
3. **Option 1:** Registriere dich mit Email/Password
4. **Option 2:** Login mit Google (wenn konfiguriert)
5. Nach Login siehst du deine persönliche Task-Liste

### Tasks verwalten
- **Neue Task:** Klicke "Neue Aufgabe" Button
- **Bearbeiten:** Klicke auf Task-Text → Auto-Save nach 1.5s
- **Priorität setzen:** Klicke Star-Icon
- **Als erledigt markieren:** Klicke Checkbox
- **Löschen:** Klicke Trash-Icon
- **Datum ändern:** Drag & Drop zu anderem Tag

### Auto-Save System
- **Automatisches Speichern** nach 1.5s Verzögerung
- **Visual Feedback** - "Speichere..." / "Gespeichert" Indikatoren
- **Exit-Optionen:**
  - ✅ **Check-Button** = Änderungen behalten
  - ❌ **X-Button** = Änderungen verwerfen
  - **Enter** = Speichern
  - **Escape** = Verwerfen

### Drag & Drop
- Ziehe Tasks zwischen verschiedenen Tagen
- Tasks werden automatisch nach Datum gruppiert:
  - Heute
  - Morgen
  - Wochentag (z.B. "Montag, 13. Oktober")
  - Ohne Datum

### Chat mit KI (optional)
- Wenn Mistral API Key konfiguriert ist
- **Natural Language Commands:**
  - "Erstelle einen Task für heute"
  - "Verschiebe den Task nach morgen"
  - "Lösche den Task X"
  - "Was sind meine Tasks?"
  - "Welche Aufgaben stehen heute an?"
  - "Leg das todo an, man!" (mit Kontext aus vorherigen Nachrichten)
- **Chat-History:** KI erinnert sich an vorherige Nachrichten
- KI antwortet in deiner Sprache
- **Intelligent Filtering:** Bei "heute" zeigt KI nur HEUTE-Tasks, nicht die komplette Liste
- Server-side Tool Execution für sichere Operationen
- Rate-Limits werden automatisch behandelt (Retries mit Wartezeiten)

### Multi-Language Features
- **Speech Recognition:** Wähle Sprache im Dropdown (rechts oben)
- **UI Language:** Automatische Erkennung oder manuelle Auswahl
- **Mistral Responses:** Automatische Spracherkennung

## 📁 Projektstruktur

```
todo-app-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main App mit Drag & Drop
│   │   ├── login/
│   │   │   ├── page.tsx                # Login/SignUp UI
│   │   │   └── actions.ts              # Auth Server Actions
│   │   ├── auth/callback/route.ts      # OAuth Callback
│   │   └── api/
│   │       ├── tasks/route.ts          # Task CRUD API
│   │       └── mistral/route.ts        # Mistral AI API mit Tools
│   ├── components/
│   │   ├── ui/                         # Shadcn Components
│   │   └── TaskCardRefactored.tsx      # Task Card mit Auto-Save
│   ├── hooks/
│   │   ├── useTaskManagement.ts        # Task Logic
│   │   ├── useMistralChat.ts           # KI Chat Logic
│   │   ├── useLocale.ts                # Browser Locale
│   │   └── useUserSettings.ts          # Persistent Settings
│   ├── lib/
│   │   ├── i18n/                       # Internationalization
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Client
│   │   │   ├── server.ts               # Server Client
│   │   │   └── middleware.ts           # Auth Middleware
│   │   └── services/
│   │       ├── ApiTaskService.ts       # Task Service
│   │       └── MistralToolsService.ts  # Mistral Tools
│   └── middleware.ts                   # Route Protection
└── .env.local                          # Environment Variables
```

## 🚀 Deployment auf Vercel

### 1. Vercel Account erstellen
1. Gehe zu [vercel.com](https://vercel.com)
2. Verbinde mit GitHub

### 2. Projekt deployen
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment starten
vercel
```

### 3. Environment Variables setzen
In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MISTRAL_API_KEY
```

### 4. Supabase Redirect URLs updaten
In Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs:**
```
https://your-app.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

### 5. Google OAuth (optional)
In Google Cloud Console → Credentials:

**Authorized redirect URIs:**
```
https://your-project.supabase.co/auth/v1/callback
```

## 🔒 Sicherheit

### Authentication
- **Cookie-based Auth** - Secure, httpOnly cookies
- **Server-Side Sessions** - Sessions werden auf dem Server validiert
- **Protected Routes** - Middleware prüft Auth bei jeder Anfrage
- **Row Level Security** - PostgreSQL Policy schützt User-Daten

### Best Practices
- Nie `SUPABASE_SERVICE_ROLE_KEY` im Frontend verwenden
- Immer `anon/public key` für Client-Side Code
- RLS Policies prüfen alle Datenbankzugriffe
- Middleware schützt alle Routes außer `/login`
- Server-side Tool Execution für Mistral AI

## 🐛 Troubleshooting

### Login funktioniert nicht
1. Prüfe Browser Console auf Fehler
2. Prüfe ob Environment Variables gesetzt sind
3. Prüfe Supabase URL Configuration
4. Clear Browser Cookies und versuche erneut

### Tasks werden nicht geladen
1. Prüfe ob User eingeloggt ist
2. Prüfe API Route: `/api/tasks`
3. Prüfe Supabase RLS Policies
4. Prüfe Browser Network Tab

### Auto-Save funktioniert nicht
1. Prüfe Browser Console auf Fehler
2. Prüfe ob Task im Edit-Modus ist
3. Prüfe Network Tab für API Calls
4. Warte 1.5s nach Eingabe

### Mistral AI funktioniert nicht
1. Prüfe ob `MISTRAL_API_KEY` gesetzt ist
2. Prüfe API Route: `/api/mistral`
3. Prüfe Browser Console auf Fehler
4. Prüfe Rate Limits

### Datum-Anzeige falsch
- Problem gelöst in v6.0! Local date formatting verwendet
- Wenn Probleme: Browser Timezone prüfen

## 📊 Features Status

- ✅ **Authentication** - Email/Password + Google OAuth
- ✅ **Multi-User** - Row Level Security
- ✅ **Task CRUD** - Erstellen, Lesen, Aktualisieren, Löschen
- ✅ **Auto-Save** - Modern UX mit Visual Feedback
- ✅ **Drag & Drop** - Date-based Repositioning
- ✅ **Timezone Fix** - Local Date Formatting
- ✅ **KI Integration** - Mistral AI mit Tool Execution
- ✅ **Multi-Language** - 60+ Sprachen unterstützt
- ✅ **Production Ready** - Deployed on Vercel
- ✅ **Type Safe** - 100% TypeScript mit Strict Rules

## 📝 Changelog

### Version 6.0.0 (Current)
- ✅ **Auto-Save System** - Modern UX mit Visual Feedback
- ✅ **Mistral Tool Integration** - Server-side Tool Execution
- ✅ **Multi-Language Support** - 60+ Sprachen für Speech Recognition
- ✅ **Persistent Settings** - User Preferences in localStorage
- ✅ **Strict TypeScript** - Enhanced Code Quality
- ✅ **Smart Task Detection** - Natural Language Processing
- ✅ **Robust Date Handling** - Konsistente Formate überall

### Version 5.0.0
- ✅ Supabase PostgreSQL statt Prisma SQLite
- ✅ Multi-User Authentication (Email + Google OAuth)
- ✅ Row Level Security für Datensicherheit
- ✅ Timezone-Fixes (Local Date Formatting)
- ✅ Production Deployment auf Vercel

### Version 4.0.0
- Prisma SQLite Integration
- Float Position System für Drag & Drop

### Version 3.0.0
- Enterprise Refactoring
- Custom Hooks Pattern
- Component Modularization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - siehe LICENSE Datei

---

**Entwickelt mit ❤️ für produktive Aufgabenverwaltung**

*Powered by Next.js 15, Supabase, TypeScript & Mistral AI*