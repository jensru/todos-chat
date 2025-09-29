#!/usr/bin/env node

/**
 * Datums-Validator für Markdown-Dashboard
 * Überprüft und korrigiert automatisch Datumsangaben und Wochentage
 */

const fs = require('fs');
const path = require('path');

class DateValidator {
  constructor() {
    this.year = 2025;
    this.months = {
      'Januar': 0, 'Februar': 1, 'März': 2, 'April': 3, 'Mai': 4, 'Juni': 5,
      'Juli': 6, 'August': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Dezember': 11
    };
    this.weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  }

  /**
   * Validiert eine Markdown-Datei auf korrekte Datumsangaben
   */
  validateMarkdownFile(filePath) {
    console.log(`🔍 Validiere Datumsangaben in: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    const corrections = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Prüfe Wochentag + Datum Kombinationen
      const weekdayMatch = line.match(/#### \*\*(\w+), (\d+)\. (\w+)\*\*/);
      if (weekdayMatch) {
        const [, weekday, day, month] = weekdayMatch;
        const issue = this.validateWeekdayDate(weekday, parseInt(day), month, lineNumber);
        if (issue) {
          issues.push(issue);
          corrections.push({
            line: lineNumber,
            original: line,
            corrected: this.correctWeekdayDate(parseInt(day), month)
          });
        }
      }

      // Prüfe Wochenbereiche
      const weekRangeMatch = line.match(/### \*\*📅 WOCHE: (\d+)\. - (\d+)\. (\w+) (\d+)\*\*/);
      if (weekRangeMatch) {
        const [, startDay, endDay, month, year] = weekRangeMatch;
        const issue = this.validateWeekRange(parseInt(startDay), parseInt(endDay), month, parseInt(year), lineNumber);
        if (issue) {
          issues.push(issue);
          corrections.push({
            line: lineNumber,
            original: line,
            corrected: this.correctWeekRange(parseInt(startDay), month, parseInt(year))
          });
        }
      }
    });

    return { issues, corrections };
  }

  /**
   * Validiert Wochentag + Datum Kombination
   */
  validateWeekdayDate(weekday, day, month, lineNumber) {
    if (!this.months[month]) return null;
    
    const date = new Date(this.year, this.months[month], day);
    const actualWeekday = this.weekdays[date.getDay()];
    
    if (actualWeekday !== weekday) {
      return {
        type: 'weekday_mismatch',
        line: lineNumber,
        expected: actualWeekday,
        found: weekday,
        date: `${day}. ${month} ${this.year}`
      };
    }
    
    return null;
  }

  /**
   * Validiert Wochenbereich
   */
  validateWeekRange(startDay, endDay, month, year, lineNumber) {
    if (!this.months[month] || year !== this.year) return null;
    
    const startDate = new Date(year, this.months[month], startDay);
    const endDate = new Date(year, this.months[month], endDay);
    
    // Prüfe ob es eine gültige Woche ist (7 Tage)
    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays !== 7) {
      return {
        type: 'invalid_week_range',
        line: lineNumber,
        found: `${startDay}. - ${endDay}.`,
        issue: `Ungültiger Wochenbereich (${diffDays} Tage statt 7)`
      };
    }
    
    // Prüfe ob der Wochenbereich mit einem Montag beginnt
    if (startDate.getDay() !== 1) {
      const mondayDate = new Date(startDate);
      mondayDate.setDate(startDate.getDate() - startDate.getDay() + 1);
      
      return {
        type: 'week_not_starting_monday',
        line: lineNumber,
        found: `${startDay}. - ${endDay}.`,
        suggested: this.getCorrectWeekRange(mondayDate)
      };
    }
    
    return null;
  }

  /**
   * Korrigiert Wochentag + Datum
   */
  correctWeekdayDate(day, month) {
    if (!this.months[month]) return null;
    
    const date = new Date(this.year, this.months[month], day);
    const correctWeekday = this.weekdays[date.getDay()];
    
    return `#### **${correctWeekday}, ${day}. ${month}**`;
  }

  /**
   * Korrigiert Wochenbereich
   */
  correctWeekRange(startDay, month, year) {
    if (!this.months[month]) return null;
    
    const startDate = new Date(year, this.months[month], startDay);
    const mondayDate = new Date(startDate);
    mondayDate.setDate(startDate.getDate() - startDate.getDay() + 1);
    
    const endDate = new Date(mondayDate);
    endDate.setDate(mondayDate.getDate() + 6);
    
    return `### **📅 WOCHE: ${mondayDate.getDate()}. - ${endDate.getDate()}. ${month} ${year}**`;
  }

  /**
   * Gibt korrekten Wochenbereich für ein Datum zurück
   */
  getCorrectWeekRange(date) {
    const mondayDate = new Date(date);
    mondayDate.setDate(date.getDate() - date.getDay() + 1);
    
    const endDate = new Date(mondayDate);
    endDate.setDate(mondayDate.getDate() + 6);
    
    const monthNames = Object.keys(this.months);
    const month = monthNames[date.getMonth()];
    
    return `${mondayDate.getDate()}. - ${endDate.getDate()}. ${month} ${date.getFullYear()}`;
  }

  /**
   * Zeigt Validierungsergebnisse
   */
  showResults(results) {
    const { issues, corrections } = results;
    
    if (issues.length === 0) {
      console.log('✅ Alle Datumsangaben sind korrekt!');
      return;
    }
    
    console.log(`\n❌ ${issues.length} Datumsprobleme gefunden:\n`);
    
    issues.forEach(issue => {
      console.log(`Zeile ${issue.line}: ${issue.type}`);
      if (issue.expected && issue.found) {
        console.log(`  Erwartet: ${issue.expected}, Gefunden: ${issue.found}`);
      }
      if (issue.date) {
        console.log(`  Datum: ${issue.date}`);
      }
      console.log('');
    });
    
    if (corrections.length > 0) {
      console.log('🔧 Vorgeschlagene Korrekturen:\n');
      corrections.forEach(correction => {
        console.log(`Zeile ${correction.line}:`);
        console.log(`  Vorher: ${correction.original}`);
        console.log(`  Nachher: ${correction.corrected}`);
        console.log('');
      });
    }
  }

  /**
   * Wendet Korrekturen automatisch an
   */
  applyCorrections(filePath, corrections) {
    if (corrections.length === 0) return;
    
    console.log(`🔧 Wende ${corrections.length} Korrekturen an...`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    corrections.forEach(correction => {
      lines[correction.line - 1] = correction.corrected;
    });
    
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, content);
    fs.writeFileSync(filePath, lines.join('\n'));
    
    console.log(`✅ Korrekturen angewendet. Backup erstellt: ${backupPath}`);
  }
}

/**
 * CLI-Interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const filePath = args[1] || './core/Dashboard - Strukturierte To-do-Übersicht.md';
  
  const validator = new DateValidator();
  
  switch (command) {
    case 'validate':
      const results = validator.validateMarkdownFile(filePath);
      validator.showResults(results);
      break;
    
    case 'fix':
      const fixResults = validator.validateMarkdownFile(filePath);
      validator.showResults(fixResults);
      if (fixResults.corrections.length > 0) {
        validator.applyCorrections(filePath, fixResults.corrections);
      }
      break;
    
    default:
      console.log('Verwendung:');
      console.log('  node date-validator.js validate [datei]  - Validiert Datumsangaben');
      console.log('  node date-validator.js fix [datei]      - Validiert und korrigiert automatisch');
      break;
  }
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = DateValidator;

