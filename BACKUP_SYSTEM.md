# Supabase Backup System

## 🛡️ Automatisches Backup-System

Dieses System erstellt **tägliche Backups** aller Supabase-Daten und speichert sie sicher im Git-Repository.

## 📁 Backup-Formate

### 1. **JSON-Backup** (`supabase-backup-YYYY-MM-DD.json`)
- Vollständige Datenstruktur
- Metadaten und Statistiken
- Einfach zu lesen und verstehen

### 2. **SQL-Backup** (`supabase-backup-YYYY-MM-DD.sql`)
- SQL-Statements für Datenbank-Wiederherstellung
- Kompatibel mit PostgreSQL/Supabase
- Struktur + Daten

### 3. **CSV-Backups** (`tasks-backup-YYYY-MM-DD.csv`, `users-backup-YYYY-MM-DD.csv`)
- Tabellarische Darstellung
- Einfache Analyse in Excel/Google Sheets
- Getrennte Dateien für Tasks und User

## 🚀 Verwendung

### Backup erstellen (manuell)
```bash
node scripts/backup-supabase.js
```

### Verfügbare Backups anzeigen
```bash
node scripts/restore-supabase.js list
```

### Aus Backup wiederherstellen
```bash
node scripts/restore-supabase.js restore supabase-backup-2025-10-15.json
```

## ⚙️ Automatische Backups

### GitHub Actions Workflow
- **Täglich um 2:00 UTC** (3:00 CET / 4:00 CEST)
- **Automatische Commits** der Backup-Dateien
- **30-Tage-Retention** (alte Backups werden automatisch gelöscht)

### Manueller Trigger
Im GitHub Repository unter **Actions** → **Supabase Daily Backup** → **Run workflow**

## 🔐 Sicherheit

### Was wird gesichert:
- ✅ **Alle Tasks** (id, title, description, notes, completed, priority, dueDate, category, tags, subtasks, globalPosition, createdAt, updatedAt)
- ✅ **Alle User** (id, email, created_at, updated_at, last_sign_in_at, email_confirmed_at, phone, phone_confirmed_at)

### Was wird NICHT gesichert:
- ❌ **Passwörter** (werden nie aus Supabase Auth exportiert)
- ❌ **Session-Tokens** (sicherheitskritisch)
- ❌ **API-Keys** (sind in Environment Variables)

## 📊 Backup-Statistiken

Jedes Backup enthält:
```json
{
  "metadata": {
    "backup_date": "2025-10-15T02:00:00.000Z",
    "backup_version": "1.0",
    "total_tasks": 73,
    "total_users": 1,
    "supabase_project": "https://your-project.supabase.co"
  }
}
```

## 🔧 Setup für GitHub Actions

### 1. Secrets hinzufügen
Im GitHub Repository unter **Settings** → **Secrets and variables** → **Actions**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (Service Role Key)
```

### 2. Workflow aktivieren
Der Workflow ist bereits konfiguriert und läuft automatisch.

## 🚨 Recovery-Szenarien

### Kompletter Datenverlust
```bash
# 1. Neuestes Backup finden
node scripts/restore-supabase.js list

# 2. Aus neuestem Backup wiederherstellen
node scripts/restore-supabase.js restore supabase-backup-2025-10-15.json
```

### Teilweise Wiederherstellung
```bash
# Backup-Datei öffnen und relevante Tasks kopieren
# Dann manuell in Supabase einfügen
```

### User-Wiederherstellung
- User werden ohne Passwort wiederhergestellt
- Müssen sich neu registrieren oder Passwort zurücksetzen
- Alle Tasks bleiben mit korrekten User-IDs verknüpft

## 📈 Monitoring

### Erfolgreiche Backups
- ✅ Backup-Dateien werden täglich committed
- ✅ Statistiken in Commit-Message sichtbar

### Fehlgeschlagene Backups
- ❌ GitHub Actions zeigt Fehler an
- ❌ Keine neuen Backup-Dateien im Repository

## 🔄 Wartung

### Backup-Bereinigung
- **Automatisch**: Backups älter als 30 Tage werden gelöscht
- **Manuell**: `rm backups/supabase-backup-YYYY-MM-DD.*`

### Repository-Größe
- Jedes Backup: ~50-100 KB
- 30 Tage: ~1.5-3 MB
- Minimaler Einfluss auf Repository-Größe

## 🎯 Vorteile

1. **Automatisch**: Keine manuelle Arbeit erforderlich
2. **Sicher**: Daten sind im Git-Repository gesichert
3. **Versioniert**: Jeder Backup ist ein Git-Commit
4. **Mehrere Formate**: JSON, SQL, CSV für verschiedene Anwendungsfälle
5. **Einfache Wiederherstellung**: Ein Befehl stellt alles wieder her
6. **Kostengünstig**: Nutzt kostenlose GitHub Actions

---

**Nie wieder Datenverlust!** 🛡️
