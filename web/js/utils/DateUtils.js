/**
 * Date Sync Component - Verwaltung der Datum-Synchronisation
 */

class DateSyncComponent {
    constructor() {
        this.currentDate = new Date();
    }

    // Get current date
    getCurrentDate() {
        return new Date();
    }

    // Format date for display
    formatDateForDisplay(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('de-DE', options);
    }

    // Format date for API (YYYY-MM-DD)
    formatDateForAPI(date) {
        return date.toISOString().split('T')[0];
    }

    // Get date string for today
    getTodayString() {
        return this.formatDateForAPI(this.getCurrentDate());
    }

    // Get formatted date string for today
    getTodayFormatted() {
        return this.formatDateForDisplay(this.getCurrentDate());
    }

    // Calculate days between dates
    getDaysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        return Math.round((date2 - date1) / oneDay);
    }

    // Get relative date string (heute, morgen, gestern, etc.)
    getRelativeDateString(date) {
        const today = this.getCurrentDate();
        const targetDate = new Date(date);
        const daysDiff = this.getDaysBetween(today, targetDate);
        
        if (daysDiff === 0) return 'heute';
        if (daysDiff === 1) return 'morgen';
        if (daysDiff === -1) return 'gestern';
        if (daysDiff > 1) return `in ${daysDiff} Tagen`;
        if (daysDiff < -1) return `vor ${Math.abs(daysDiff)} Tagen`;
        
        return this.formatDateForDisplay(targetDate);
    }

    // Check if date is today
    isToday(date) {
        const today = this.getCurrentDate();
        const targetDate = new Date(date);
        return today.toDateString() === targetDate.toDateString();
    }

    // Check if date is tomorrow
    isTomorrow(date) {
        const tomorrow = new Date(this.getCurrentDate());
        tomorrow.setDate(tomorrow.getDate() + 1);
        const targetDate = new Date(date);
        return tomorrow.toDateString() === targetDate.toDateString();
    }

    // Check if date is yesterday
    isYesterday(date) {
        const yesterday = new Date(this.getCurrentDate());
        yesterday.setDate(yesterday.getDate() - 1);
        const targetDate = new Date(date);
        return yesterday.toDateString() === targetDate.toDateString();
    }

    // Check if date is this week
    isThisWeek(date) {
        const today = this.getCurrentDate();
        const targetDate = new Date(date);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        
        return targetDate >= startOfWeek && targetDate <= endOfWeek;
    }

    // Get week range for current week
    getCurrentWeekRange() {
        const today = this.getCurrentDate();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        
        return {
            start: startOfWeek,
            end: endOfWeek,
            startString: this.formatDateForAPI(startOfWeek),
            endString: this.formatDateForAPI(endOfWeek)
        };
    }

    // Get deadline status for a task
    getDeadlineStatus(task) {
        if (!task.due_date) return 'no_deadline';
        
        const dueDate = new Date(task.due_date);
        const today = this.getCurrentDate();
        const daysDiff = this.getDaysBetween(today, dueDate);
        
        if (daysDiff < 0) return 'overdue';
        if (daysDiff === 0) return 'due_today';
        if (daysDiff === 1) return 'due_tomorrow';
        if (daysDiff <= 7) return 'due_this_week';
        return 'due_later';
    }

    // Get deadline text for display
    getDeadlineText(status) {
        const statusMap = {
            'overdue': 'Überfällig',
            'due_today': 'Heute fällig',
            'due_tomorrow': 'Morgen fällig',
            'due_this_week': 'Diese Woche',
            'due_later': 'Später fällig',
            'no_deadline': 'Kein Datum'
        };
        return statusMap[status] || status;
    }

    // Parse date from various formats
    parseDate(dateString) {
        if (!dateString) return null;
        
        // Try different date formats
        const formats = [
            'YYYY-MM-DD',
            'DD.MM.YYYY',
            'MM/DD/YYYY',
            'DD-MM-YYYY'
        ];
        
        for (const format of formats) {
            try {
                let date;
                if (format === 'YYYY-MM-DD') {
                    date = new Date(dateString);
                } else if (format === 'DD.MM.YYYY') {
                    const [day, month, year] = dateString.split('.');
                    date = new Date(year, month - 1, day);
                } else if (format === 'MM/DD/YYYY') {
                    const [month, day, year] = dateString.split('/');
                    date = new Date(year, month - 1, day);
                } else if (format === 'DD-MM-YYYY') {
                    const [day, month, year] = dateString.split('-');
                    date = new Date(year, month - 1, day);
                }
                
                if (date && !isNaN(date.getTime())) {
                    return date;
                }
            } catch (error) {
                continue;
            }
        }
        
        return null;
    }

    // Validate date string
    isValidDate(dateString) {
        const date = this.parseDate(dateString);
        return date !== null && !isNaN(date.getTime());
    }

    // Get next working day (skip weekends)
    getNextWorkingDay(date = null) {
        const startDate = date ? new Date(date) : this.getCurrentDate();
        let nextDay = new Date(startDate);
        
        do {
            nextDay.setDate(nextDay.getDate() + 1);
        } while (nextDay.getDay() === 0 || nextDay.getDay() === 6); // Skip Sunday (0) and Saturday (6)
        
        return nextDay;
    }

    // Get working days between two dates
    getWorkingDaysBetween(startDate, endDate) {
        let count = 0;
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            if (current.getDay() !== 0 && current.getDay() !== 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        
        return count;
    }

    // Update current date (for testing or timezone changes)
    updateCurrentDate(newDate) {
        this.currentDate = new Date(newDate);
    }

    // Get timezone offset
    getTimezoneOffset() {
        return this.getCurrentDate().getTimezoneOffset();
    }

    // Format time
    formatTime(date) {
        return date.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Format date and time
    formatDateTime(date) {
        return `${this.formatDateForDisplay(date)} um ${this.formatTime(date)}`;
    }
}

// Globale Instanz
const dateSync = new DateSyncComponent();

// Globale Funktionen für Kompatibilität
function getCurrentDate() {
    return dateSync.getCurrentDate();
}

function formatDateForDisplay(date) {
    return dateSync.formatDateForDisplay(date);
}

function formatDateForAPI(date) {
    return dateSync.formatDateForAPI(date);
}

function getTodayString() {
    return dateSync.getTodayString();
}

function getTodayFormatted() {
    return dateSync.getTodayFormatted();
}

function getDeadlineText(status) {
    return dateSync.getDeadlineText(status);
}
