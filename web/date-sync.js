/**
 * Datumssynchronisation für Todo Dashboard
 * 
 * Diese Datei verwaltet das aktuelle Datum und ermöglicht
 * eine persistente Synchronisation zwischen verschiedenen Komponenten
 */

class DateSync {
  constructor() {
    this.currentDate = null;
    this.loadCurrentDate();
  }

  // Lade das aktuelle Datum aus localStorage oder setze Standard
  loadCurrentDate() {
    const savedDate = localStorage.getItem('todo-dashboard-current-date');
    
    if (savedDate) {
      this.currentDate = new Date(savedDate);
    } else {
      // Standard: Heute (aktuelles Datum)
      this.currentDate = new Date();
      this.saveCurrentDate();
    }
  }

  // Speichere das aktuelle Datum in localStorage
  saveCurrentDate() {
    localStorage.setItem('todo-dashboard-current-date', this.currentDate.toISOString());
  }

  // Setze ein neues aktuelles Datum
  setCurrentDate(date) {
    this.currentDate = new Date(date);
    this.saveCurrentDate();
    this.notifyDateChange();
  }

  // Erhalte das aktuelle Datum
  getCurrentDate() {
    return new Date(this.currentDate);
  }

  // Erhalte den aktuellen Wochentag (0=Sonntag, 1=Montag, etc.)
  getCurrentDayOfWeek() {
    return this.currentDate.getDay();
  }

  // Erhalte den Start der aktuellen Woche (Montag)
  getCurrentWeekStart() {
    const weekStart = new Date(this.currentDate);
    weekStart.setDate(this.currentDate.getDate() - this.getCurrentDayOfWeek() + 1);
    return weekStart;
  }

  // Erhalte den Start der nächsten Woche
  getNextWeekStart() {
    const nextWeekStart = new Date(this.getCurrentWeekStart());
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    return nextWeekStart;
  }

  // Formatiere Datum für API (YYYY-MM-DD)
  formatDateForAPI(date) {
    return date.toISOString().split('T')[0];
  }

  // Formatiere Datum für Anzeige (DD.MM.YYYY)
  formatDateForDisplay(date) {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Formatiere Wochentag auf Deutsch
  formatDayOfWeek(dayIndex) {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[dayIndex];
  }

  // Formatiere Monat auf Deutsch
  formatMonth(monthIndex) {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[monthIndex];
  }

  // Berechne Deadline-Status basierend auf aktuellem Datum
  calculateDeadlineStatus(dueDate) {
    if (!dueDate) return 'no_deadline';
    
    const due = new Date(dueDate);
    const today = this.getCurrentDate();
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due_today';
    if (diffDays === 1) return 'due_tomorrow';
    if (diffDays <= 3) return 'due_soon';
    if (diffDays <= 7) return 'due_this_week';
    
    return 'due_later';
  }

  // Benachrichtige alle Komponenten über Datumsänderung
  notifyDateChange() {
    const event = new CustomEvent('dateChanged', {
      detail: { currentDate: this.getCurrentDate() }
    });
    window.dispatchEvent(event);
  }

  // Aktualisiere das Datum auf heute
  updateToToday() {
    this.currentDate = new Date();
    this.saveCurrentDate();
    this.notifyDateChange();
  }

  // Prüfe ob das gespeicherte Datum heute ist, falls nicht aktualisiere es
  checkAndUpdateDate() {
    const savedDate = new Date(this.currentDate);
    const today = new Date();
    
    // Vergleiche nur Datum (ohne Zeit)
    const savedDateOnly = new Date(savedDate.getFullYear(), savedDate.getMonth(), savedDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (savedDateOnly.getTime() !== todayOnly.getTime()) {
      this.updateToToday();
    }
  }

  // Erhalte alle Wochentage für die aktuelle Woche
  getWeekDays() {
    const weekStart = this.getCurrentWeekStart();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push({
        date: day,
        dayName: this.formatDayOfWeek(day.getDay()),
        dayNumber: day.getDate(),
        monthName: this.formatMonth(day.getMonth()),
        apiFormat: this.formatDateForAPI(day),
        displayFormat: this.formatDateForDisplay(day)
      });
    }
    
    return days;
  }

  // Erhalte die aktuelle Woche als String
  getCurrentWeekRange() {
    const weekStart = this.getCurrentWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${this.formatDateForDisplay(weekStart)} - ${this.formatDateForDisplay(weekEnd)}`;
  }

  // Erhalte die nächste Woche als String
  getNextWeekRange() {
    const nextWeekStart = this.getNextWeekStart();
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    
    return `${this.formatDateForDisplay(nextWeekStart)} - ${this.formatDateForDisplay(nextWeekEnd)}`;
  }
}

// Globale Instanz erstellen
window.dateSync = new DateSync();

// Export für Node.js (falls benötigt)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateSync;
}
