#!/usr/bin/env node

/**
 * Daily Routine Generator
 * Erstellt automatisch wiederkehrende tägliche Tasks
 */

const fs = require('fs');
const path = require('path');

class DailyRoutineGenerator {
  constructor() {
    this.coreDir = './core';
    this.datesDir = './core/dates';
    this.routineTemplate = [
      '- [ ] Mails',
      '- [ ] Linkedin', 
      '- [ ] Tabs',
      '- [ ] Little sorting bis zur NAS'
    ];
  }

  /**
   * Erstellt eine neue Tagesdatei mit Daily Routine
   */
  createDailyFile(date) {
    const dateStr = this.formatDateForFilename(date);
    const filePath = path.join(this.datesDir, `${dateStr}.md`);
    
    // Prüfe ob Datei bereits existiert
    if (fs.existsSync(filePath)) {
      console.log(`📅 Datei existiert bereits: ${dateStr}.md`);
      return this.addRoutineToExistingFile(filePath);
    }

    const dayName = this.getDayName(date);
    const monthName = this.getMonthName(date);
    const dayNumber = date.getDate();
    const year = date.getFullYear();

    const content = `# 📅 ${dayName}, ${dayNumber}. ${monthName} ${year}

## 🔄 Daily Routine
${this.routineTemplate.join('\n')}

## 📋 Heute's Tasks
- [ ] Neue Tasks hier hinzufügen...

`;

    fs.writeFileSync(filePath, content);
    console.log(`✅ Neue Tagesdatei erstellt: ${dateStr}.md`);
    return filePath;
  }

  /**
   * Fügt Daily Routine zu einer bestehenden Datei hinzu
   */
  addRoutineToExistingFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Prüfe ob Daily Routine bereits existiert
    if (content.includes('## 🔄 Daily Routine')) {
      console.log(`📅 Daily Routine bereits vorhanden in ${path.basename(filePath)}`);
      return filePath;
    }

    // Füge Daily Routine nach dem Titel hinzu
    const lines = content.split('\n');
    const titleLine = lines.findIndex(line => line.startsWith('# 📅'));
    
    if (titleLine !== -1) {
      // Füge nach dem Titel ein
      lines.splice(titleLine + 1, 0, '', '## 🔄 Daily Routine', ...this.routineTemplate, '');
      
      content = lines.join('\n');
      fs.writeFileSync(filePath, content);
      console.log(`✅ Daily Routine hinzugefügt zu ${path.basename(filePath)}`);
    }

    return filePath;
  }

  /**
   * Erstellt Daily Routine für mehrere Tage
   */
  createRoutineForDateRange(startDate, endDate) {
    const files = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const filePath = this.createDailyFile(new Date(currentDate));
      files.push(filePath);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`✅ Daily Routine erstellt für ${files.length} Tage`);
    return files;
  }

  /**
   * Erstellt Daily Routine für die nächsten N Tage
   */
  createRoutineForNextDays(days = 7) {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days - 1);
    
    return this.createRoutineForDateRange(today, endDate);
  }

  /**
   * Erstellt Daily Routine für die aktuelle Woche
   */
  createRoutineForCurrentWeek() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Montag
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sonntag
    
    return this.createRoutineForDateRange(weekStart, weekEnd);
  }

  /**
   * Aktualisiert alle bestehenden Tagesdateien mit Daily Routine
   */
  updateAllExistingFiles() {
    if (!fs.existsSync(this.datesDir)) {
      console.log(`📁 Verzeichnis nicht gefunden: ${this.datesDir}`);
      return [];
    }

    const files = fs.readdirSync(this.datesDir)
      .filter(file => file.endsWith('.md') && file.match(/^\d{4}-\d{2}-\d{2}/))
      .map(file => path.join(this.datesDir, file));

    const updatedFiles = [];
    
    files.forEach(filePath => {
      const updated = this.addRoutineToExistingFile(filePath);
      updatedFiles.push(updated);
    });

    console.log(`✅ ${updatedFiles.length} Dateien aktualisiert`);
    return updatedFiles;
  }

  /**
   * Formatiert Datum für Dateiname (YYYY-MM-DD)
   */
  formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Gibt deutschen Wochentag zurück
   */
  getDayName(date) {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[date.getDay()];
  }

  /**
   * Gibt deutschen Monatsnamen zurück
   */
  getMonthName(date) {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[date.getMonth()];
  }

  /**
   * Zeigt Statistiken über Daily Routine
   */
  showStats() {
    if (!fs.existsSync(this.datesDir)) {
      console.log('📁 Kein dates-Verzeichnis gefunden');
      return;
    }

    const files = fs.readdirSync(this.datesDir)
      .filter(file => file.endsWith('.md') && file.match(/^\d{4}-\d{2}-\d{2}/));

    let withRoutine = 0;
    let withoutRoutine = 0;

    files.forEach(file => {
      const content = fs.readFileSync(path.join(this.datesDir, file), 'utf8');
      if (content.includes('## 🔄 Daily Routine')) {
        withRoutine++;
      } else {
        withoutRoutine++;
      }
    });

    console.log('\n📊 Daily Routine Statistiken:');
    console.log(`   • Tagesdateien gesamt: ${files.length}`);
    console.log(`   • Mit Daily Routine: ${withRoutine}`);
    console.log(`   • Ohne Daily Routine: ${withoutRoutine}`);
    console.log(`   • Abdeckung: ${Math.round((withRoutine / files.length) * 100)}%`);
  }
}

/**
 * CLI-Interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const generator = new DailyRoutineGenerator();

  switch (command) {
    case 'today':
      generator.createDailyFile(new Date());
      break;

    case 'tomorrow':
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      generator.createDailyFile(tomorrow);
      break;

    case 'week':
      generator.createRoutineForCurrentWeek();
      break;

    case 'next':
      const days = parseInt(args[1]) || 7;
      generator.createRoutineForNextDays(days);
      break;

    case 'update':
      generator.updateAllExistingFiles();
      break;

    case 'stats':
      generator.showStats();
      break;

    case 'range':
      if (args.length < 3) {
        console.log('Verwendung: node daily-routine-generator.js range YYYY-MM-DD YYYY-MM-DD');
        return;
      }
      const startDate = new Date(args[1]);
      const endDate = new Date(args[2]);
      generator.createRoutineForDateRange(startDate, endDate);
      break;

    default:
      console.log('🔄 Daily Routine Generator');
      console.log('');
      console.log('Verwendung:');
      console.log('  node daily-routine-generator.js today     - Erstellt Routine für heute');
      console.log('  node daily-routine-generator.js tomorrow  - Erstellt Routine für morgen');
      console.log('  node daily-routine-generator.js week      - Erstellt Routine für aktuelle Woche');
      console.log('  node daily-routine-generator.js next [N] - Erstellt Routine für nächste N Tage (Standard: 7)');
      console.log('  node daily-routine-generator.js update   - Aktualisiert alle bestehenden Dateien');
      console.log('  node daily-routine-generator.js stats    - Zeigt Statistiken');
      console.log('  node daily-routine-generator.js range START END - Erstellt Routine für Datumsbereich');
      console.log('');
      console.log('Beispiele:');
      console.log('  node daily-routine-generator.js today');
      console.log('  node daily-routine-generator.js next 14');
      console.log('  node daily-routine-generator.js range 2025-10-07 2025-10-14');
      break;
  }
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = DailyRoutineGenerator;
