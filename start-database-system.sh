#!/bin/bash

# Datenbank-Management System Starter
# Startet alle Services für das lokale Datenbank-System

echo "🚀 Starte Datenbank-Management System..."

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktion für farbigen Output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    print_error "Node.js ist nicht installiert!"
    exit 1
fi

# Prüfe ob npm installiert ist
if ! command -v npm &> /dev/null; then
    print_error "npm ist nicht installiert!"
    exit 1
fi

# Installiere Dependencies falls nötig
if [ ! -d "node_modules" ]; then
    print_status "Installiere Dependencies..."
    npm install express
    if [ $? -eq 0 ]; then
        print_success "Dependencies installiert"
    else
        print_error "Fehler beim Installieren der Dependencies"
        exit 1
    fi
fi

# Erstelle data-Verzeichnis falls es nicht existiert
if [ ! -d "data" ]; then
    print_status "Erstelle data-Verzeichnis..."
    mkdir -p data
fi

# Erstelle scripts-Verzeichnis falls es nicht existiert
if [ ! -d "scripts" ]; then
    print_status "Erstelle scripts-Verzeichnis..."
    mkdir -p scripts
fi

# Initiale Synchronisation
print_status "Führe initiale Synchronisation durch..."
node scripts/markdown-parser.js
if [ $? -eq 0 ]; then
    print_success "Initiale Synchronisation abgeschlossen"
else
    print_warning "Initiale Synchronisation fehlgeschlagen - fahre trotzdem fort"
fi

# Starte Auto-Sync Service im Hintergrund
print_status "Starte Auto-Sync Service..."
node scripts/auto-sync.js start &
AUTO_SYNC_PID=$!
print_success "Auto-Sync Service gestartet (PID: $AUTO_SYNC_PID)"

# Warte kurz
sleep 2

# Starte Database API
print_status "Starte Database API..."
node scripts/database-api.js 3001 &
API_PID=$!
print_success "Database API gestartet (PID: $API_PID)"

# Warte kurz
sleep 3

# Öffne Browser
print_status "Öffne Browser..."
if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:3001/database-management.html"
    open "http://localhost:3001/index.html"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:3001/database-management.html"
    xdg-open "http://localhost:3001/index.html"
elif command -v start &> /dev/null; then
    # Windows
    start "http://localhost:3001/database-management.html"
    start "http://localhost:3001/index.html"
else
    print_warning "Browser konnte nicht automatisch geöffnet werden"
    print_status "Öffne manuell: http://localhost:3001/database-management.html"
fi

print_success "Datenbank-Management System gestartet!"
echo ""
echo "📊 Services:"
echo "   • Auto-Sync Service: PID $AUTO_SYNC_PID"
echo "   • Database API: PID $API_PID"
echo ""
echo "🌐 URLs:"
echo "   • Management Dashboard: http://localhost:3001/database-management.html"
echo "   • Haupt-Dashboard: http://localhost:3001/index.html"
echo "   • API Health Check: http://localhost:3001/api/health"
echo ""
echo "🛑 Zum Beenden:"
echo "   • Drücke Ctrl+C"
echo "   • Oder führe aus: kill $AUTO_SYNC_PID $API_PID"
echo ""

# Funktion zum sauberen Beenden
cleanup() {
    print_status "Beende Services..."
    kill $AUTO_SYNC_PID $API_PID 2>/dev/null
    print_success "Services beendet"
    exit 0
}

# Signal-Handler für sauberes Beenden
trap cleanup SIGINT SIGTERM

# Warte auf Benutzer-Input
echo "Drücke Ctrl+C zum Beenden..."
while true; do
    sleep 1
done



