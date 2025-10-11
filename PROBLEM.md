# Todo-App Deployment Problem

## 🚨 Problem Summary

**Status:** 🔄 **IN ARBEIT** - Zwei aktive Bugs auf Vercel

## 📋 Aktuelle Probleme (11. Oktober 2025, 17:48 CEST)

### 1. **Login-Problem**
- **Symptom:**
  - Desktop: Login klappt nur nach Refresh oder zweimal Button drücken
  - Mobile: Login funktioniert gar nicht
  - Console zeigt orangenes Fähnchen (Warnung nicht lesbar)
- **Ursache:** Cookie-Synchronisation zwischen Server Action und Middleware
- **Versuche:**
  1. `router.push()` + `router.refresh()` - funktioniert nicht
  2. API Route für Login - funktioniert nicht
  3. Server Actions mit `redirect()` - funktioniert nicht
  4. Server Actions mit `revalidatePath()` + `window.location.href` - funktioniert nicht
  5. Server Actions mit `redirect()` direkt (aktueller Stand) - wird getestet
- **Technische Details:**
  - Server Actions setzen Cookies via `createClient()` aus `@/lib/supabase/server`
  - Middleware liest Cookies aber sieht Session nicht sofort
  - Möglicherweise Race Condition zwischen Cookie-Set und Middleware-Check

### 2. **Datum/Timezone-Problem**
- **Symptom:**
  - Heute: Samstag, 11. Oktober 2025
  - Morgen: Sonntag, 12. Oktober
  - App zeigt "Morgen: 12. Oktober" korrekt an
  - **ABER:** Die Tasks unter "Morgen" sind die vom Montag 13. Oktober (einen Tag ZU FRÜH)
- **Beispiel:**
  - Task mit `dueDate: "2025-10-13T00:00:00"` (Montag 13. Okt)
  - Wird angezeigt unter "Morgen: 12. Oktober" (Sonntag)
  - Sollte angezeigt werden unter "Montag: 13. Oktober"
- **Ursache:** Supabase gibt Daten als `"2025-10-13T00:00:00"` zurück
  - String wird geparst als lokale Zeit: `new Date(2025, 9, 13)` = 13. Okt 00:00 CEST
  - Aber beim Grouping/Display wird das Datum um einen Tag verschoben
- **Versuche:**
  1. Regex `^\d{4}-\d{2}-\d{2}$` - matched nicht wegen Time-Teil
  2. Regex `^(\d{4})-(\d{2})-(\d{2})` - matched und parsed zu lokalem Datum (aktueller Stand)
- **Aktueller Code:** `src/lib/services/ApiTaskService.ts:18-33`
  ```typescript
  if (typeof task.dueDate === 'string') {
    const dateMatch = task.dueDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  }
  ```
- **Problem:** Parse-Logik scheint korrekt, aber Tasks werden trotzdem einen Tag zu früh angezeigt
- **Nächster Debug-Schritt:** Prüfen ob Problem beim Grouping (`getGroupedTasks`) oder Display (`formatDate`) liegt

## 🏗️ Architektur-Änderungen (abgeschlossen)

### Prisma → Supabase SDK Migration (✅)
- **Grund:** Vercel 500-Fehler wegen Prisma Client Generation
- **Gelöscht:**
  - `src/lib/services/DatabaseTaskService.ts` (Prisma-based)
  - `prisma/schema.prisma` und Migrations
  - `@prisma/client` und `prisma` aus package.json
  - `vercel.json` mit Prisma Config
- **Ersetzt:**
  - `src/app/api/tasks/route.ts` - nutzt jetzt Supabase SDK
  - `src/app/api/tasks/[id]/route.ts` - nutzt jetzt Supabase SDK

### Legacy Code Cleanup (✅)
- **Gelöscht:**
  - `src/lib/services/TaskService.ts` (localStorage-based, 280 Zeilen)
  - `src/app/api/sync-tasks/route.ts` (JSON file sync, 313 Zeilen)
- **Gesamt:** 593 Zeilen alte Code entfernt

## 🔧 Technical Details

### Environment Variables (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://qdjbgpuymvhnezylnolc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:_tlalocTO77_@db.qdjbgpuymvhnezylnolc.supabase.co:5432/postgres
MIGRATION_USER_EMAIL=admin@example.com
MIGRATION_USER_PASSWORD=admin123
MISTRAL_API_KEY=qi5CvFfyPFhuy4NqHNHBJ42mS2IIL2WK
```

### Authentication Flow
**Files:**
- `src/app/login/page.tsx` - Login UI mit Google OAuth + Email/Password
- `src/app/login/actions.ts` - Server Actions für Login/SignUp
- `src/middleware.ts` - Auth Check mit Supabase SSR
- `src/lib/supabase/server.ts` - Server Client mit Cookie Handling
- `src/app/auth/callback/route.ts` - OAuth Callback Handler

**Current Login Flow:**
1. User submits form → `loginAction(formData)`
2. Server Action calls `supabase.auth.signInWithPassword()`
3. Cookies get set via `createClient()` cookie handlers
4. `revalidatePath('/', 'layout')` invalidates cache
5. `redirect('/')` throws NEXT_REDIRECT
6. Middleware should see cookies and allow access
7. **Problem:** Middleware doesn't see session immediately

### Date Handling
**API Response:** `curl https://kickboost-todos.vercel.app/api/tasks`
```json
{
  "tasks": [{
    "dueDate": "2025-10-13T00:00:00"
  }]
}
```

**Parsing Logic:** `src/lib/services/ApiTaskService.ts`
- Regex matched "2025-10-13" aus "2025-10-13T00:00:00"
- Erstellt `new Date(2025, 9, 13)` (9 = Oktober, da 0-indexed)
- Display Logic: `src/lib/services/ApiTaskService.ts:192-216`

## 🎯 Current Status

### ✅ Was funktioniert
- Tasks API (GET/POST/PUT/DELETE) - 200 OK
- Task CRUD Operations
- Drag & Drop Reordering
- Supabase Database Connection
- Google OAuth (wenn man erstmal eingeloggt ist)
- Vercel Deployment

### ❌ Was nicht funktioniert
- Login (Desktop: braucht Refresh, Mobile: geht gar nicht)
- Datums-Anzeige (einen Tag zu spät)

## 🚀 Nächste Schritte

### Option A: Fresh Start mit neuem Chat
**Pro:**
- Token Budget zurücksetzen
- Klarer Kopf
- PROBLEM.md als Kontext-Basis

**Contra:**
- Muss Chat-History zusammenfassen
- Kontext-Aufbau dauert

### Option B: In diesem Chat weitermachen
**Pro:**
- Alle Versuche dokumentiert
- Voller Kontext vorhanden

**Contra:**
- 32k von 200k Tokens verbraucht
- Mehrere fehlgeschlagene Fix-Versuche

## 🔍 Debug-Informationen

### Letzte Deployments
```bash
# c002702 - Fix timezone parsing for datetime strings
# ee463ef - Fix login redirect by using server-side redirect()
```

### Zu untersuchen
1. **Login:** Console orange flag - was ist die Warnung?
2. **Login:** Warum sieht Middleware Session nicht nach Cookie-Set?
3. **Datum:** Tasks mit dueDate "2025-10-13" werden unter "Morgen: 12. Okt" angezeigt statt unter "Montag: 13. Okt"
4. **Datum:** Prüfen ob Bug beim Parsing, Grouping oder Display liegt

### Test-Befehle
```bash
# Aktuelles Datum
date  # Sat Oct 11 17:48:49 CEST 2025

# API Test
curl -s "https://kickboost-todos.vercel.app/api/tasks" | jq '.tasks[0].dueDate'

# Browser Console (mobile)
# → Orange flag untersuchen
```

---

**Erstellt:** 11. Oktober 2025, 17:48 CEST
**Status:** 🔄 IN ARBEIT
**Token Usage:** 32k/200k (16%)
**Next:** Entscheidung Fresh Start vs. Weitermachen
