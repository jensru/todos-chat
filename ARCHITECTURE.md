# 🏗️ Todo-App - Enterprise Architecture Documentation

**Version**: 6.0.0 | **Status**: ✅ Production Ready | **Datum**: 12.10.2025

---

## 📋 Projektübersicht

Eine moderne, professionelle Todo-App mit KI-Integration und Multi-User-Authentifizierung, entwickelt mit Next.js 15, TypeScript, Supabase und Mistral AI. Die App bietet erweiterte Task-Management-Funktionen mit intelligenter KI-Unterstützung, Auto-Save und sicherer Authentifizierung.

### 🎯 Hauptfunktionen
- 🔐 **Supabase Auth** - Email/Password + Google OAuth
- ✅ **Task-Management** mit Drag & Drop (Date-based Position System)
- 🤖 **Mistral AI Integration** für intelligente Chat-Funktionen und Task-Manipulation
- 💾 **Auto-Save System** - Automatisches Speichern mit Visual Feedback
- 🌍 **Multi-Language Support** - UI, Mistral Responses, Speech Recognition (60+ Sprachen)
- 📅 **Timezone-korrekte Datumsanzeige** (Local Date Formatting)
- ⭐ **Prioritäts-System** mit visuellen Indikatoren
- 📁 **Kategorie-Management** mit benutzerdefinierten Kategorien
- 💾 **Supabase PostgreSQL** für robuste Cloud-Persistierung

---

## 🏗️ Technologie-Stack

### Frontend
- **Next.js 15** - React Framework mit App Router
- **TypeScript** - Typsichere Entwicklung (100% Coverage, Strict Rules)
- **Tailwind CSS** - Utility-first CSS Framework
- **Shadcn/ui** - Moderne UI-Komponenten
- **Lucide React** - Icon-Bibliothek
- **@dnd-kit** - Drag & Drop System

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **@supabase/ssr** - Server-Side Rendering mit Cookie-based Auth
- **Next.js API Routes** - Serverless Backend
- **PostgreSQL** - Relationale Cloud-Datenbank

### KI & Services
- **Mistral AI** - KI-Integration für intelligente Antworten und Task-Manipulation
- **Supabase Auth** - OAuth + Email/Password Authentication
- **Web Speech API** - Browser-basierte Spracherkennung

### Entwicklung & Deployment
- **ESLint** - Code-Qualität und Konsistenz (0 Errors)
- **Husky** - Pre-commit Hooks
- **Vercel** - Production Deployment
- **Git** - Version Control

---

## 📁 Enterprise-Architektur (v6.0)

```
todo-app-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Main App mit Drag & Drop
│   │   ├── layout.tsx                   # App Layout
│   │   ├── login/
│   │   │   ├── page.tsx                 # Login UI (Email/Password + Google OAuth)
│   │   │   └── actions.ts               # Server Actions für Auth
│   │   ├── auth/
│   │   │   └── callback/route.ts        # OAuth Callback Handler
│   │   └── api/
│   │       ├── mistral/route.ts         # Mistral AI API mit Tool Execution
│   │       └── tasks/
│   │           ├── route.ts             # Task CRUD API (Supabase)
│   │           └── [id]/route.ts        # Task Update/Delete API
│   ├── components/
│   │   ├── ui/                          # Shadcn/ui Base Components
│   │   ├── TaskCardRefactored.tsx       # Task Card mit Auto-Save
│   │   ├── TaskHeader.tsx               # Header-Komponente
│   │   ├── TaskBody.tsx                 # Body-Komponente
│   │   ├── SubtaskList.tsx              # Subtask-Komponente
│   │   └── TaskActions.tsx              # Actions-Komponente
│   ├── hooks/                           # Custom Hooks Layer
│   │   ├── useTaskManagement.ts         # Task Management mit Local Date Logic
│   │   ├── useMistralChat.ts            # KI-Chat Management
│   │   ├── useGoals.ts                  # Goals Management
│   │   ├── useLocale.ts                 # Browser Locale Detection
│   │   └── useUserSettings.ts           # Persistent User Settings
│   ├── lib/
│   │   ├── types.ts                     # Type Definitions
│   │   ├── utils.ts                     # Shadcn Utilities
│   │   ├── i18n/                        # Internationalization
│   │   │   ├── index.ts                 # Translation Helpers
│   │   │   └── translations.ts          # Translation Strings
│   │   ├── supabase/
│   │   │   ├── client.ts                # Supabase Client für Browser
│   │   │   ├── server.ts                # Supabase Client für Server Components
│   │   │   └── middleware.ts            # updateSession Utility
│   │   └── services/
│   │       ├── ApiTaskService.ts        # Task Service (API Calls)
│   │       └── MistralToolsService.ts   # Mistral AI Tools Service
│   └── middleware.ts                    # Auth Middleware (Supabase SSR)
└── .env.local
    ├── NEXT_PUBLIC_SUPABASE_URL
    ├── NEXT_PUBLIC_SUPABASE_ANON_KEY
    ├── SUPABASE_SERVICE_ROLE_KEY
    └── MISTRAL_API_KEY
```

### 🎯 v6.0 Highlights:
- **Auto-Save System** - Modern UX mit Visual Feedback
- **Mistral Tool Integration** - Server-side Tool Execution für Task-Manipulation
- **Multi-Language Support** - 60+ Sprachen für Speech Recognition
- **Persistent Settings** - User Preferences in localStorage
- **Strict TypeScript** - Enhanced Code Quality mit Pre-commit Hooks
- **Robust Date Handling** - Konsistente Datum-Formate überall

---

## 🔐 Authentication Flow

### Supabase Auth mit SSR (Server-Side Rendering)

**Files:**
- `src/app/login/page.tsx` - Login UI (Email/Password + Google OAuth)
- `src/app/login/actions.ts` - Server Actions für Login/SignUp
- `src/lib/supabase/middleware.ts` - updateSession Utility
- `src/middleware.ts` - Auth Middleware
- `src/lib/supabase/server.ts` - Server Client (Cookie-based)
- `src/lib/supabase/client.ts` - Browser Client
- `src/app/auth/callback/route.ts` - OAuth Callback Handler

### Login Flow:
```typescript
1. User submits form → loginAction(formData)
2. Server Action: supabase.auth.signInWithPassword()
3. Server Action: revalidatePath('/', 'layout')
4. Server Action: redirect('/')
5. Middleware: updateSession() refreshes auth cookies
6. Middleware: getUser() checks authentication
7. User is redirected to app
```

### Middleware Implementation:
```typescript
// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

### Key Features:
- **Cookie-based Authentication** - Secure, httpOnly cookies
- **Automatic Token Refresh** - Middleware handles expired tokens
- **Protected Routes** - Middleware redirects unauthenticated users
- **Google OAuth** - One-click social login
- **Type-safe** - Full TypeScript support

---

## 💾 Auto-Save System

### Modern UX Pattern
**File:** `src/components/TaskCardRefactored.tsx`

### Features:
- **Debounced Auto-Save** - 1.5s Verzögerung nach Eingabe
- **Visual Feedback** - "Speichere..." / "Gespeichert" Indikatoren
- **Conflict Prevention** - 3s Pause nach externen Updates (Mistral)
- **Intuitive Exit** - Check = behalten, X = verwerfen
- **Keyboard Shortcuts** - Enter = speichern, Escape = verwerfen

### Implementation:
```typescript
// Auto-save with debouncing
const scheduleAutoSave = useCallback((delay: number = 1500) => {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  const timeout = setTimeout(() => autoSave(), delay);
  setAutoSaveTimeout(timeout);
}, [autoSave, autoSaveTimeout]);

// Conflict prevention
const taskLastUpdated = new Date(task.updatedAt || task.createdAt);
const timeSinceUpdate = now.getTime() - taskLastUpdated.getTime();
if (timeSinceUpdate < 3000) return; // Skip auto-save
```

---

## 🤖 Mistral AI Integration

### Server-Side Tool Execution mit Chat-History
**File:** `src/app/api/mistral/route.ts`

### Available Tools:
- **create_task** - Erstelle neue Tasks
- **update_task** - Aktualisiere bestehende Tasks (mit intelligenter Suche)
- **delete_task** - Lösche Tasks
- **list_tasks** - Zeige alle Tasks (gruppiert nach Datum) – Tool liefert intern JSON-Struktur für deterministische Filterung; der Assistent gibt im Chat niemals JSON aus

### Chat-History System:
- **Message History** wird mit jeder Anfrage übergeben
- **localStorage** speichert Chat-Verlauf client-side
- **Kontext-Erhaltung:** Mistral versteht Referenzen wie "Leg das todo an, man!"
- **Automatische Filterung:** Nur relevante Messages werden übertragen (keine Loading/Welcome Messages)

### Smart Task Detection:
```typescript
// Natural language patterns
"Brief schreiben an Peter" → create_task
"Verschiebe Task nach morgen" → update_task (mit taskDate: "today", dueDate: "tomorrow")
"Lösche Task X" → delete_task
"Was sind meine Tasks?" → list_tasks
```

### Tool-Calling Flow (2 API Calls):
```typescript
1. First API Call: User message + message history sent to Mistral
2. Mistral detects intent and calls appropriate tool
3. Server-side tool execution with Supabase auth
4. Tool results: JSON-Struktur (grouped Sections) zur zuverlässigen Filterung
5. Second API Call: Tool results sent back with role: 'tool'
6. Mistral processes tool results and filters response
7. Database update with proper user filtering
8. UI refresh with needsRefresh flag
9. Visual feedback to user
```

### Date Handling:
- **Today Context** - Mistral receives current date in ISO format (YYYY-MM-DD) in system prompt
- **Tool Results** - Tasks returned with ISO dates for consistent comparison
- **Robust Parsing** - Handles "today", "tomorrow", YYYY-MM-DD formats
- **Timezone Safe** - Consistent date formatting across all functions
- **Grouped Output** - Tasks grouped as: HEUTE, MORGEN, SPÄTER, ÜBERFÄLLIG

### Rate-Limit Handling:
- **Server**: keine Retries; liefert `retryAfter` bei 429
- **Client**: respektiert `Retry-After` als Cooldown, blockt weitere Sendungen; kein Auto‑Retry
- **Optional**: Single‑Call‑Modus (ENV) halbiert Anzahl Requests

---

## 🌍 Multi-Language Support

### Internationalization System
**Files:** `src/lib/i18n/`, `src/hooks/useLocale.ts`, `src/hooks/useUserSettings.ts`

### Features:
- **UI Languages** - English (default), German, French
- **Mistral Responses** - Automatic language detection and response
- **Speech Recognition** - 60+ languages supported
- **Persistent Settings** - User preferences stored in localStorage

### Speech Language Map:
```typescript
export const speechLanguageMap: Record<string, string> = {
  en: 'en-US', de: 'de-DE', fr: 'fr-FR', es: 'es-ES',
  it: 'it-IT', pt: 'pt-BR', ru: 'ru-RU', ja: 'ja-JP',
  ko: 'ko-KR', zh: 'zh-CN', ar: 'ar-SA', hi: 'hi-IN',
  // ... 50+ more languages
};
```

### Implementation:
```typescript
// Browser locale detection
const detectedLanguage = getBrowserLanguage();
const supportedLanguages = ['en', 'de', 'fr'];
const finalLanguage = supportedLanguages.includes(detectedLanguage) 
  ? detectedLanguage : 'en';

// Persistent user settings
const { settings, updateSettings } = useUserSettings();
// settings.speechLanguage, settings.uiLanguage
```

---

## 📅 Date & Timezone Handling

### Problem: UTC Timezone Offset
**Issue:** `toISOString()` converts local dates to UTC, causing off-by-one errors
```typescript
// ❌ Wrong: 13. Okt 00:00 CEST → 12. Okt 22:00 UTC → "2025-10-12"
const dateKey = task.dueDate.toISOString().split('T')[0]

// ✅ Correct: Local date formatting
const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
```

### Solution Implementation:
**File:** `src/hooks/useTaskManagement.ts`

**Fixed Locations:**
1. **Date grouping** in `groupedTasks`
2. **Today comparison** in `groupedTasks`
3. **formatDate** today/tomorrow comparison
4. **Drag & drop** date key calculations

### API to Display Flow:
```
1. Supabase returns: "2025-10-13T00:00:00" (datetime string)
2. ApiTaskService parses to: new Date(2025, 9, 13) (local date object)
3. useTaskManagement groups by: "2025-10-13" (local string)
4. formatDate displays: "Montag, 13. Oktober" (German locale)
```

---

## 🔄 Drag & Drop System

### Date-based Position System
Tasks are grouped by date and sorted by `globalPosition` within each group:

```typescript
// Position calculation
const dateString = dateKey === 'ohne-datum' ? '999999' : dateKey.replace(/-/g, '')
const positionInDate = String(index + 1).padStart(2, '0')
const globalPosition = parseInt(dateString + positionInDate)

// Examples:
// "2025-10-13" + "01" = 20251013_01 = task 1 on Oct 13
// "2025-10-13" + "02" = 20251013_02 = task 2 on Oct 13
// "ohne-datum" + "01" = 99999901 = first task without date
```

### Drag & Drop Features:
- **Within Date:** Reorder tasks within same date group
- **Across Dates:** Move tasks to different date groups
- **Optimistic Updates:** Immediate UI feedback before API confirmation
- **Rollback on Error:** Automatic state revert if API fails

---

## 📊 Datenbank-Schema

### Supabase PostgreSQL Schema
```sql
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

-- Row Level Security (RLS) enabled
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tasks
CREATE POLICY "Users can only access their own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);
```

### Type Mapping:
```typescript
// API returns TIMESTAMPTZ as ISO string: "2025-10-13T00:00:00"
dueDate: string | null  // API response

// Parsed to JavaScript Date object (local timezone)
dueDate: Date | null    // Frontend state
```

---

## 🪝 Custom Hooks APIs

### useTaskManagement - Task Business Logic
```typescript
export function useTaskManagement(): {
  tasks: Task[];
  loading: boolean;
  handleTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  handleTaskDelete: (taskId: string) => Promise<void>;
  handleAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getTaskStats: () => { total: number; completed: number; active: number; highPriority: number; completionRate: number };
  groupedTasks: Record<string, Task[]>;  // Uses local date formatting
  formatDate: (dateString: string) => string;  // Timezone-aware formatting
  loadData: () => Promise<void>;
  // Drag & Drop methods
  handleReorderWithinDate: (dateKey: string, taskIds: string[]) => Promise<void>;
  handleMoveTaskToDate: (taskId: string, newDate: Date | null) => Promise<void>;
  handleReorderAcrossDates: (taskId: string, targetDate: Date | null, targetIndex: number) => Promise<void>;
  handleTaskUpdateOptimistic: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  // Animation
  newTaskIds: Set<string>;
  movingUpTaskIds: Set<string>;
  movingDownTaskIds: Set<string>;
}
```

### useMistralChat - KI Chat Management
```typescript
export function useMistralChat(): {
  messages: Message[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: (taskContext?: { tasks: number; goals: number; taskService?: any }) => Promise<void>;
  isServiceReady: boolean;
  clearChat: () => void;
}
```

### useUserSettings - Persistent Settings
```typescript
export function useUserSettings(): {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  isReady: boolean;
}

interface UserSettings {
  speechLanguage: string;
  uiLanguage: string; // 'en', 'de', 'fr', 'auto'
  theme: 'light' | 'dark' | 'system';
}
```

---

## 🔧 Type Definitions

### Core Types
```typescript
export interface ITask {
  id: string;
  userId: string;  // Supabase user ID
  title: string;
  description?: string;
  completed: boolean;
  priority: boolean;
  dueDate?: Date;  // JavaScript Date object (local timezone)
  category?: string;
  tags: string[];
  subtasks: ISubtask[];
  createdAt: Date;
  updatedAt: Date;
  globalPosition: number;
}

// Type Aliases für einfache Nutzung
export type Task = ITask;
export type Subtask = ISubtask;
export type Message = IMessage;
```

---

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 20+
- Supabase Account
- Mistral API Key

### Installation
```bash
# Repository klonen
git clone <repository-url>
cd todo-app-nextjs

# Abhängigkeiten installieren
npm install

# Environment Variables konfigurieren
cp env.template .env.local
# Füge hinzu:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - MISTRAL_API_KEY

# Entwicklungsserver starten
npm run dev
```

### Supabase Setup
1. Erstelle ein Supabase Projekt
2. Führe das Schema aus (siehe Datenbank-Schema oben)
3. Aktiviere Email Auth in Supabase Dashboard
4. Konfiguriere Google OAuth Provider (optional)
5. Kopiere API Keys in `.env.local`

---

## 🚀 Deployment (Vercel)

### Environment Variables auf Vercel:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
MISTRAL_API_KEY=qi5CvFfyPFhuy4NqHNHBJ42mS2IIL2WK
```

### Deployment-Prozess:
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment
vercel

# Environment Variables setzen
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add MISTRAL_API_KEY
```

### Google OAuth Redirect URIs:
```
https://your-project.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

---

## 📊 Performance & Metriken

### Code-Qualität:
- **ESLint Errors**: `0` ✅ **100% Clean**
- **Type Safety**: `100%` ✅ TypeScript Coverage
- **Strict TypeScript**: Enhanced rules with pre-commit hooks
- **Authentication**: Multi-user with RLS
- **Database**: Cloud PostgreSQL (Supabase)
- **Deployment**: Production on Vercel

### Features Status:
- ✅ **Authentication** - Email/Password + Google OAuth
- ✅ **Multi-User** - Row Level Security (RLS)
- ✅ **Task Management** - CRUD Operations
- ✅ **Drag & Drop** - Date-based positioning
- ✅ **Auto-Save** - Modern UX with visual feedback
- ✅ **Timezone Handling** - Local date formatting
- ✅ **KI Integration** - Mistral AI with Tool Execution
- ✅ **Multi-Language** - 60+ languages supported
- ✅ **Production Ready** - Deployed on Vercel

---

## 🤖 KI-Integration

### Mistral AI Features
- **Chat-Funktionalität** für Unterhaltungen
- **Task-Manipulation** - Create, Update, Delete, List
- **Natural Language Processing** - "Verschiebe Task nach morgen"
- **Smart Task Detection** - Automatische Task-Erkennung
- **Multi-Language Support** - Antworten in User-Sprache
- **Server-Side Tool Execution** - Sichere, authentifizierte Operationen

### API-Endpunkte
- `POST /api/mistral` - Mistral AI Chat mit Tool Execution
- Rate Limit Handling für 429-Fehler
- Fehlerbehandlung mit benutzerfreundlichen Nachrichten
- `needsRefresh` Flag für UI-Updates

---

## 📝 Changelog

### Version 6.0 (Aktuell) - Auto-Save + Multi-Language
- ✅ **Auto-Save System** - Modern UX mit Visual Feedback
- ✅ **Mistral Tool Integration** - Server-side Tool Execution
- ✅ **Multi-Language Support** - 60+ Sprachen für Speech Recognition
- ✅ **Persistent Settings** - User Preferences in localStorage
- ✅ **Strict TypeScript** - Enhanced Code Quality
- ✅ **Robust Date Handling** - Konsistente Formate überall
- ✅ **Smart Task Detection** - Natural Language Processing

### Version 5.0 - Supabase + Authentication
- ✅ **Supabase Migration** - Prisma SQLite → Supabase PostgreSQL
- ✅ **Authentication** - Email/Password + Google OAuth
- ✅ **Multi-User Support** - Row Level Security (RLS)
- ✅ **Middleware Pattern** - Supabase updateSession standard
- ✅ **Timezone Fixes** - Local date formatting (4 locations fixed)
- ✅ **Production Deployment** - Vercel mit Environment Variables
- ✅ **100% Functional** - Beide Bugs (Login + Datum) gefixt

### Version 4.0 - SQLite + Float Position System
- ✅ **SQLite Migration** - JSON → Prisma ORM + SQLite
- ✅ **Float Position System** - O(1) Drag & Drop
- ✅ **Direction-Aware Drag** - Tasks landen genau am Drop-Ziel
- ✅ **UI Synchronization** - Automatische Props-Updates

### Version 3.0 - Enterprise Refactoring
- ✅ **Komponenten-Modularisierung** - TaskCard → 4 fokussierte Komponenten
- ✅ **Custom Hooks** - Business Logic extrahiert
- ✅ **Performance-Optimierung** - useCallback/useMemo

---

## 🎯 Best Practices

### Authentication
1. **Server Components**: Use `createClient()` from `@/lib/supabase/server`
2. **Client Components**: Use `createClient()` from `@/lib/supabase/client`
3. **Middleware**: Always use `updateSession()` from `@/lib/supabase/middleware`
4. **Protected Routes**: Middleware handles auth checks automatically

### Date Handling
1. **Never use `.toISOString().split('T')[0]`** for date keys
2. **Always use local date formatting** for grouping and comparison
3. **API dates**: Parse to Date objects immediately after receiving
4. **Display dates**: Use locale-aware formatting (`de-DE`)

### Type Safety
1. **I-Prefix Interfaces**: ESLint-konforme Namenskonvention
2. **Type Aliases**: Einfache Nutzung mit `type Task = ITask`
3. **Explicit Returns**: Alle Funktionen haben Return Types
4. **Supabase Types**: Use generated types from Supabase CLI

### Auto-Save
1. **Debouncing**: Use 1.5s delay for text inputs
2. **Conflict Prevention**: Check for recent external updates
3. **Visual Feedback**: Always show save status to user
4. **Graceful Exit**: Provide clear save/discard options

---

**Entwickelt mit ❤️ und modernen Web-Technologien**

*Architecture Documentation aktualisiert am 12.10.2025 - Version 6.0.0*