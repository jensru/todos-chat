# Todo-App: Supabase + Vercel Migration

## ✅ Abgeschlossen

- ✅ Ordnerstruktur vereinfacht (flache Struktur)
- ✅ Supabase-Dependencies installiert
- ✅ Prisma-Schema auf PostgreSQL migriert mit userId
- ✅ Supabase Client-Helper erstellt (client.ts, server.ts)
- ✅ Login/Signup UI mit Google OAuth erstellt
- ✅ Auth-Middleware implementiert
- ✅ API-Routen mit userId-Filter und Auth erweitert
- ✅ Next.js 15 params.id Warning behoben
- ✅ Daten-Migrations-Script für 75 Tasks erstellt
- ✅ GitHub Repository vorbereitet

## 🚀 Nächste Schritte (mit User)

### 1. Supabase-Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com) und logge dich ein
2. Klicke "New Project"
3. Wähle Organisation und gib Projekt-Name ein (z.B. "todos-jens")
4. Wähle Region (Frankfurt für Deutschland)
5. Gib ein sicheres Passwort ein
6. Klicke "Create new project"
7. Warte bis Projekt erstellt ist (2-3 Minuten)

### 2. Supabase-Konfiguration
1. Gehe zu "Settings" → "API"
2. Kopiere:
   - **Project URL** (z.B. `https://xyz.supabase.co`)
   - **anon public** Key
   - **service_role** Key (Secret!)
3. Gehe zu "Authentication" → "Providers"
4. Aktiviere "Email" Provider
5. Aktiviere "Google" Provider und konfiguriere OAuth

### 3. Environment Variables setzen
1. Kopiere `env.template` zu `.env.local`
2. Fülle alle Werte aus:
   ```bash
   cp env.template .env.local
   # Bearbeite .env.local mit deinen Supabase-Werten
   ```

### 4. Datenbank-Schema erstellen
```bash
# Prisma Client generieren
npx prisma generate

# Migration zu Supabase ausführen
npx prisma db push
```

### 5. Daten-Migration ausführen
```bash
# Alle 75 Tasks zu Supabase migrieren
node scripts/migrate-to-supabase.js
```

### 6. Lokales Testing
```bash
# App starten
npm run dev

# Teste:
# - Login/Signup auf http://localhost:3000/login
# - Tasks erstellen/bearbeiten
# - Notizen-Funktionalität
# - Mistral-Integration
```

### 7. GitHub Repository erstellen
1. Gehe zu [github.com](https://github.com) und erstelle neues Repository
2. Repository-Name: z.B. "todos-app"
3. **NICHT** "Initialize with README" (da bereits vorhanden)
4. Verbinde lokales Repository:
   ```bash
   git remote add origin https://github.com/deinusername/todos-app.git
   git branch -M main
   git push -u origin main
   ```

### 8. Vercel Deployment
1. Gehe zu [vercel.com](https://vercel.com) und logge dich ein
2. Klicke "Import Project"
3. Wähle dein GitHub Repository
4. Framework: Next.js (automatisch erkannt)
5. Root Directory: `.` (da flache Struktur)
6. Environment Variables hinzufügen:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MISTRAL_API_KEY`
7. Klicke "Deploy"
8. Erhalte Production URL (z.B. `todos-jens.vercel.app`)

### 9. Supabase Redirect URLs konfigurieren
1. Gehe zurück zu Supabase → "Authentication" → "URL Configuration"
2. Füge hinzu:
   - `https://deine-app.vercel.app`
   - `https://deine-app.vercel.app/auth/callback`

### 10. Production Testing
- Teste Login/Signup auf der Vercel-URL
- Teste vom Handy aus
- Teste Google OAuth
- Teste alle Features

## 📱 Mobile-Zugriff

Nach dem Deployment kannst du die App über die Vercel-URL auf deinem Handy erreichen!

## 🔧 Troubleshooting

### Prisma-Fehler
```bash
npx prisma generate
npx prisma db push
```

### Auth-Probleme
- Prüfe Supabase Redirect URLs
- Prüfe Environment Variables in Vercel

### Migration-Probleme
- Prüfe `.env.local` Konfiguration
- Prüfe Supabase Service Role Key

## 📞 Support

Bei Problemen: Prüfe die Logs in Vercel Dashboard oder Supabase Dashboard.
