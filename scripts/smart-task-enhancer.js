#!/usr/bin/env node

/**
 * Smart Task Enhancement System
 * Erweitert Tasks mit intelligenten Metadaten und Due Dates
 */

const fs = require('fs');
const path = require('path');

// DateSync für Node.js (vereinfachte Version)
class DateSync {
  constructor() {
    // Standard: 6. Oktober 2025 (wie im Markdown)
    this.currentDate = new Date('2025-10-06');
  }

  getCurrentDate() {
    return new Date(this.currentDate);
  }

  getCurrentWeekStart() {
    const weekStart = new Date(this.currentDate);
    weekStart.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1);
    return weekStart;
  }

  formatDateForAPI(date) {
    return date.toISOString().split('T')[0];
  }
}

class SmartTaskEnhancer {
  constructor() {
    this.tasksFile = './data/tasks.json';
    this.enhancedTasksFile = './data/smart-tasks.json';
    this.dateSync = new DateSync();
  }

  // Lade aktuelle Tasks
  loadTasks() {
    try {
      const data = fs.readFileSync(this.tasksFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Fehler beim Laden der Tasks:', error);
      return { tasks: [] };
    }
  }

  // Speichere erweiterte Tasks
  saveEnhancedTasks(enhancedTasks) {
    try {
      fs.writeFileSync(this.enhancedTasksFile, JSON.stringify(enhancedTasks, null, 2));
      console.log('✅ Enhanced Tasks gespeichert');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  }

  // Erkenne Due Dates aus Task-Titel
  extractDueDate(task) {
    const title = task.title.toLowerCase();
    
    // Datum-Patterns
    const patterns = [
      { pattern: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, format: 'DD.MM.YYYY' },
      { pattern: /(\d{1,2})\.(\d{1,2})/, format: 'DD.MM' },
      { pattern: /heute|today/, format: 'today' },
      { pattern: /morgen|tomorrow/, format: 'tomorrow' },
      { pattern: /nächste woche|next week/, format: 'next_week' },
      { pattern: /diese woche|this week/, format: 'this_week' },
      { pattern: /ende der woche|end of week/, format: 'end_of_week' }
    ];

    for (const { pattern, format } of patterns) {
      const match = title.match(pattern);
      if (match) {
        return this.parseDate(match, format);
      }
    }

    // Respektiere bereits vorhandene Due Dates aus dem Markdown
    if (task.due_date) {
      return task.due_date;
    }
    
    // Montag Tasks (6. Oktober)
    if (title.includes('bene') || title.includes('testemonial') || 
        title.includes('steffen') || title.includes('tim wg') ||
        title.includes('push') || title.includes('linkend in post') ||
        title.includes('post zu 5') || title.includes('mitgründer suchen') ||
        title.includes('alle leute hallo') || title.includes('noch mehr rauskommen') ||
        title.includes('cv dieses jahr') || title.includes('pascal antworten') ||
        title.includes('tool seiten') || title.includes('wireframes tool')) {
      return this.dateSync.formatDateForAPI(currentWeekStart); // Montag dieser Woche
    }
    
    // Dienstag Tasks (7. Oktober)
    if (title.includes('check24') || title.includes('alloy') ||
        title.includes('erste daten')) {
      const tuesday = new Date(currentWeekStart);
      tuesday.setDate(currentWeekStart.getDate() + 1);
      return this.dateSync.formatDateForAPI(tuesday); // Dienstag dieser Woche
    }
    
    // Mittwoch Tasks (8. Oktober)
    if (title.includes('werk1') || title.includes('lungenarzt') ||
        title.includes('stromanbieter') || title.includes('huk') ||
        title.includes('zahnversicherung') || title.includes('mieterverein') ||
        title.includes('kretschmer') || title.includes('nebenkostenabrechnungen') ||
        title.includes('linkedin zu substack')) {
      const wednesday = new Date(currentWeekStart);
      wednesday.setDate(currentWeekStart.getDate() + 2);
      return this.dateSync.formatDateForAPI(wednesday); // Mittwoch dieser Woche
    }
    
    // Donnerstag Tasks (9. Oktober)
    if (title.includes('10.10.') || title.includes('lungenarzttermin') ||
        title.includes('pricing-ideen') || title.includes('marketing seiten')) {
      const thursday = new Date(currentWeekStart);
      thursday.setDate(currentWeekStart.getDate() + 3);
      return this.dateSync.formatDateForAPI(thursday); // Donnerstag dieser Woche
    }
    
    // Samstag Tasks (11. Oktober) - Wochenende
    if (title.includes('schlafzimmer') || title.includes('steuer2024') ||
        title.includes('miete erhöhen') || title.includes('heldenverlies') ||
        title.includes('klettrwald') || title.includes('tauchen') ||
        title.includes('superfly') || title.includes('therme erding')) {
      const currentWeekStart = this.dateSync.getCurrentWeekStart();
      const saturday = new Date(currentWeekStart);
      saturday.setDate(currentWeekStart.getDate() + 5);
      return this.dateSync.formatDateForAPI(saturday); // Samstag dieser Woche
    }
    
    // Woche 13.-19. Oktober 2025
    if (title.includes('zahnärztin') || title.includes('e-mails') ||
        title.includes('booklist') || title.includes('book app')) {
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(currentWeekStart.getDate() + 7);
      return this.dateSync.formatDateForAPI(nextWeekStart); // Montag nächste Woche
    }
    
    // 26. Oktober 2025 (Sonntag)
    if (title.includes('olympia bürgerentscheid')) {
      const october26 = new Date('2025-10-26');
      return this.dateSync.formatDateForAPI(october26);
    }
    
    // November 2025 Tasks
    if (title.includes('slk') || title.includes('touran') || title.includes('tüv')) {
      return '2025-11-01'; // November 2025
    }
    
    // Dezember 2025 Tasks
    if (title.includes('gründungszuschuss') || title.includes('dezember') ||
        title.includes('januar') || title.includes('blake et mortimer') ||
        title.includes('junior et senior') || title.includes('corto maltese') ||
        title.includes('asterix') || title.includes('spirou')) {
      return '2025-12-01'; // Dezember 2025
    }
    
    // Spezielle Datums-Erkennung für explizite Zeitangaben
    if (title.includes('ende dezember 2025') || title.includes('spätestens ende dezember')) {
      return '2025-12-31'; // Ende Dezember 2025
    }
    
    if (title.includes('dezember') || title.includes('januar')) {
      // Für Dezember/Januar Tasks - setze auf Ende der aktuellen Woche
      const sunday = new Date(currentWeekStart);
      sunday.setDate(currentWeekStart.getDate() + 6);
      return this.dateSync.formatDateForAPI(sunday);
    }

    return null;
  }

  // Formatiere Datum für API (YYYY-MM-DD)
  formatDateForAPI(date) {
    return date.toISOString().split('T')[0];
  }

  // Parse Datum basierend auf Format
  parseDate(match, format) {
    const today = new Date();
    
    switch (format) {
      case 'today':
        return today.toISOString().split('T')[0];
      
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        return startOfWeek.toISOString().split('T')[0];
      
      case 'next_week':
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() - today.getDay() + 8);
        return nextWeek.toISOString().split('T')[0];
      
      case 'end_of_week':
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 5);
        return endOfWeek.toISOString().split('T')[0];
      
      case 'DD.MM.YYYY':
        const [, day, month, year] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      case 'DD.MM':
        const [, day2, month2] = match;
        const currentYear = today.getFullYear();
        return `${currentYear}-${month2.padStart(2, '0')}-${day2.padStart(2, '0')}`;
      
      default:
        return null;
    }
  }

  // Erkenne Priorität aus Task-Titel
  extractPriority(task) {
    const title = task.title.toLowerCase();
    
    // Hohe Priorität
    if (title.includes('🔥') || title.includes('urgent') || title.includes('dringend') || 
        title.includes('!!!') || title.includes('wichtig') || title.includes('sofort')) {
      return 'high';
    }
    
    // Niedrige Priorität
    if (title.includes('📝') || title.includes('low') || title.includes('niedrig') || 
        title.includes('später') || title.includes('optional')) {
      return 'low';
    }
    
    // Mittlere Priorität (Standard)
    return 'medium';
  }

  // Erkenne Tags aus Task-Titel
  extractTags(task) {
    const title = task.title.toLowerCase();
    const tags = [];
    
    // Business Tags
    if (title.includes('business') || title.includes('verkauf') || title.includes('kunde') || 
        title.includes('sales') || title.includes('lead')) {
      tags.push('business');
    }
    
    // Development Tags
    if (title.includes('tool') || title.includes('entwicklung') || title.includes('code') || 
        title.includes('programmierung') || title.includes('alloy')) {
      tags.push('development');
    }
    
    // Marketing Tags
    if (title.includes('marketing') || title.includes('post') || title.includes('linkedin') || 
        title.includes('content') || title.includes('workshop')) {
      tags.push('marketing');
    }
    
    // PUSH Tags
    if (title.includes('push') || title.includes('präse') || title.includes('präsentation')) {
      tags.push('PUSH');
    }
    
    // Meeting Tags
    if (title.includes('meeting') || title.includes('termin') || title.includes('besprechung')) {
      tags.push('meeting');
    }
    
    // Personal Tags
    if (title.includes('persönlich') || title.includes('gesundheit') || title.includes('arzt') || 
        title.includes('versicherung') || title.includes('steuer')) {
      tags.push('personal');
    }
    
    // Urgent Tags
    if (title.includes('🔥') || title.includes('urgent') || title.includes('dringend')) {
      tags.push('urgent');
    }
    
    return tags;
  }

  // Berechne Task-Komplexität
  calculateComplexity(task) {
    let complexity = 1; // Basis-Komplexität
    
    // Subtasks erhöhen Komplexität
    if (task.subtasks && task.subtasks.length > 0) {
      complexity += task.subtasks.length * 0.5;
    }
    
    // Lange Titel = komplexer
    if (task.title.length > 100) {
      complexity += 1;
    }
    
    // Spezielle Keywords
    const title = task.title.toLowerCase();
    if (title.includes('workshop') || title.includes('präsentation') || title.includes('meeting')) {
      complexity += 1;
    }
    
    if (title.includes('entwicklung') || title.includes('programmierung') || title.includes('tool')) {
      complexity += 1.5;
    }
    
    return Math.min(complexity, 5); // Max 5
  }

  // Berechne geschätzte Dauer
  estimateDuration(task) {
    const complexity = this.calculateComplexity(task);
    const title = task.title.toLowerCase();
    
    let baseMinutes = 30; // Basis 30 Minuten
    
    // Anpassung basierend auf Komplexität
    baseMinutes *= complexity;
    
    // Spezielle Anpassungen
    if (title.includes('meeting') || title.includes('besprechung')) {
      baseMinutes = 60; // Meetings = 1 Stunde
    }
    
    if (title.includes('workshop') || title.includes('präsentation')) {
      baseMinutes = 120; // Workshops = 2 Stunden
    }
    
    if (title.includes('entwicklung') || title.includes('programmierung')) {
      baseMinutes = 180; // Development = 3 Stunden
    }
    
    return Math.round(baseMinutes);
  }

  // Berechne Deadline-Status
  calculateDeadlineStatus(task) {
    if (!task.due_date) return 'no_deadline';
    
    const today = new Date();
    const dueDate = new Date(task.due_date);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due_today';
    if (diffDays === 1) return 'due_tomorrow';
    if (diffDays <= 3) return 'due_soon';
    if (diffDays <= 7) return 'due_this_week';
    
    return 'due_later';
  }

  // Erweitere einzelne Task
  enhanceTask(task) {
    const enhanced = { ...task };
    
    // Due Date extrahieren
    enhanced.due_date = this.extractDueDate(task) || task.due_date;
    
    // Priorität extrahieren
    enhanced.priority = this.extractPriority(task);
    
    // Tags extrahieren und zusammenführen
    const extractedTags = this.extractTags(task);
    enhanced.tags = [...new Set([...(task.tags || []), ...extractedTags])];
    
    // Komplexität berechnen
    enhanced.complexity = this.calculateComplexity(task);
    
    // Geschätzte Dauer
    enhanced.estimated_duration_minutes = this.estimateDuration(task);
    
    // Deadline-Status
    enhanced.deadline_status = this.calculateDeadlineStatus(enhanced);
    
    // Smart Score (0-100)
    enhanced.smart_score = this.calculateSmartScore(enhanced);
    
    // Kategorie (mit Hierarchie-Unterstützung)
    enhanced.category = this.determineCategory(enhanced);
    
    // Parent-Context aus Markdown-Hierarchie
    enhanced.parent_context = this.extractParentContext(enhanced);
    
    // Hierarchie-Level (basierend auf Einrückung im Markdown)
    enhanced.hierarchy_level = this.determineHierarchyLevel(enhanced);
    
    // Markdown-Sektion für Gruppierung
    enhanced.markdown_section = this.extractMarkdownSection(enhanced);
    
    // Erweitere auch Subtasks
    if (enhanced.subtasks && enhanced.subtasks.length > 0) {
      enhanced.subtasks = enhanced.subtasks.map(subtask => ({
        ...subtask,
        hierarchy_level: 2, // Subtasks sind immer Level 2
        parent_task: enhanced.title,
        category: enhanced.category,
        priority: enhanced.priority,
        tags: [...(enhanced.tags || []), 'subtask']
      }));
    }
    
    // Zeitstempel
    enhanced.enhanced_at = new Date().toISOString();
    
    return enhanced;
  }

  // Berechne Smart Score
  calculateSmartScore(task) {
    let score = 50; // Basis-Score
    
    // Priorität
    if (task.priority === 'high') score += 30;
    else if (task.priority === 'medium') score += 15;
    else score += 5;
    
    // Deadline-Status
    switch (task.deadline_status) {
      case 'overdue': score += 40; break;
      case 'due_today': score += 35; break;
      case 'due_tomorrow': score += 25; break;
      case 'due_soon': score += 15; break;
      case 'due_this_week': score += 10; break;
      default: score += 5;
    }
    
    // Tags
    if (task.tags.includes('urgent')) score += 20;
    if (task.tags.includes('business')) score += 15;
    if (task.tags.includes('PUSH')) score += 10;
    
    return Math.min(score, 100);
  }

  // Bestimme Kategorie basierend auf Markdown-Hierarchie
  determineCategory(task) {
    // Zuerst Tags-basierte Kategorien
    if (task.tags.includes('business')) return 'Business';
    if (task.tags.includes('development')) return 'Development';
    if (task.tags.includes('marketing')) return 'Marketing';
    if (task.tags.includes('personal')) return 'Personal';
    if (task.tags.includes('PUSH')) return 'PUSH';
    if (task.tags.includes('meeting')) return 'Meetings';
    
    // Dann Markdown-Hierarchie-basierte Kategorien
    const hierarchyCategory = this.extractHierarchyCategory(task);
    if (hierarchyCategory) return hierarchyCategory;
    
    return 'General';
  }

  // Extrahiere Kategorie aus Markdown-Hierarchie
  extractHierarchyCategory(task) {
    const title = task.title.toLowerCase();
    
    // Zeitbasierte Kategorien
    if (title.includes('montag') || title.includes('monday')) return 'Montag';
    if (title.includes('dienstag') || title.includes('tuesday')) return 'Dienstag';
    if (title.includes('mittwoch') || title.includes('wednesday')) return 'Mittwoch';
    if (title.includes('donnerstag') || title.includes('thursday')) return 'Donnerstag';
    if (title.includes('freitag') || title.includes('friday')) return 'Freitag';
    if (title.includes('wochenende') || title.includes('weekend')) return 'Wochenende';
    
    // Projekt-basierte Kategorien
    if (title.includes('push') || title.includes('präse') || title.includes('präsentation')) return 'PUSH';
    if (title.includes('check24') || title.includes('workshop')) return 'Check24';
    if (title.includes('bene') || title.includes('sustain')) return 'Sustain';
    if (title.includes('alloy') || title.includes('tool')) return 'Tool-Entwicklung';
    
    // Funktions-basierte Kategorien
    if (title.includes('meeting') || title.includes('besprechung') || title.includes('termin')) return 'Meetings';
    if (title.includes('versicherung') || title.includes('steuer') || title.includes('arzt')) return 'Administrativ';
    if (title.includes('post') || title.includes('linkedin') || title.includes('content')) return 'Marketing';
    if (title.includes('verkauf') || title.includes('kunde') || title.includes('lead')) return 'Business';
    
    return null;
  }

  // Extrahiere Parent-Context aus Markdown-Struktur
  extractParentContext(task) {
    const title = task.title.toLowerCase();
    
    // Erkenne Parent-Tasks
    if (title.includes('bene') && title.includes('meeting')) {
      return {
        parent: 'Bene (Sustain) Meeting',
        context: 'Meeting-Vorbereitung',
        section: 'Montag Nachmittag'
      };
    }
    
    if (title.includes('push') && title.includes('build')) {
      return {
        parent: 'PUSH Build Test',
        context: 'Tool-Optimierung',
        section: 'Montag Nachmittag'
      };
    }
    
    if (title.includes('check24')) {
      return {
        parent: 'Check24 Workshop',
        context: 'Workshop-Vorbereitung',
        section: 'Dienstag'
      };
    }
    
    return null;
  }

  // Extrahiere Markdown-Sektion für bessere Gruppierung
  extractMarkdownSection(task) {
    const title = task.title.toLowerCase();
    
    // Montag Tasks
    if (title.includes('montag') || title.includes('6. oktober') || 
        title.includes('bene') || title.includes('push') || 
        title.includes('steffen') || title.includes('tim wg') ||
        title.includes('testemonial') || title.includes('linkend in post') ||
        title.includes('post zu 5') || title.includes('mitgründer suchen') ||
        title.includes('alle leute hallo') || title.includes('noch mehr rauskommen') ||
        title.includes('cv dieses jahr')) {
      return 'Montag Nachmittag, 6. Oktober';
    }
    
    // Dienstag Tasks
    if (title.includes('dienstag') || title.includes('7. oktober') ||
        title.includes('check24') || title.includes('alloy') ||
        title.includes('erste daten')) {
      return 'Dienstag, 7. Oktober';
    }
    
    // Mittwoch Tasks
    if (title.includes('mittwoch') || title.includes('8. oktober') ||
        title.includes('werk1') || title.includes('lungenarzt') ||
        title.includes('stromanbieter') || title.includes('huk') ||
        title.includes('zahnversicherung') || title.includes('mieterverein') ||
        title.includes('kretschmer') || title.includes('nebenkostenabrechnungen') ||
        title.includes('linkedin zu substack')) {
      return 'Mittwoch, 8. Oktober';
    }
    
    // Donnerstag Tasks
    if (title.includes('donnerstag') || title.includes('9. oktober') ||
        title.includes('10.10.') || title.includes('lungenarzttermin') ||
        title.includes('pricing-ideen') || title.includes('marketing seiten')) {
      return 'Donnerstag, 9. Oktober';
    }
    
    // Wochenende Tasks
    if (title.includes('wochenende') || title.includes('11. und 12. oktober') ||
        title.includes('schlafzimmer') || title.includes('steuer2024') ||
        title.includes('miete erhöhen') || title.includes('heldenverlies') ||
        title.includes('klettrwald') || title.includes('tauchen') ||
        title.includes('superfly') || title.includes('therme erding')) {
      return 'Wochenende 11. und 12. Oktober';
    }
    
    return 'Weitere Tasks';
  }

  // Bestimme Hierarchie-Level basierend auf Markdown-Struktur
  determineHierarchyLevel(task) {
    const title = task.title.toLowerCase();
    
    // Haupt-Tasks (Level 1)
    if (title.includes('**') && !title.includes('  -')) {
      return 1;
    }
    
    // Unter-Tasks (Level 2) - erkennt durch Einrückung oder spezifische Keywords
    if (title.includes('zuhören') || title.includes('hilfe wieder') || 
        title.includes('sofort markieren') || title.includes('fragen nach') ||
        title.includes('agentisches') || title.includes('workshop-teaser') ||
        title.includes('post zusammen') || title.includes('3 stufiges') ||
        title.includes('colors vorher') || title.includes('daily repeat') ||
        title.includes('guided interactions') || title.includes('microcopy') ||
        title.includes('handout')) {
      return 2;
    }
    
    // Standard Level
    return 1;
  }

  // Erweitere alle Tasks
  enhanceAllTasks() {
    console.log('🧠 Erweitere Tasks mit Smart Features...');
    
    const data = this.loadTasks();
    const enhancedTasks = data.tasks.map(task => this.enhanceTask(task));
    
    const result = {
      ...data,
      tasks: enhancedTasks,
      enhanced_at: new Date().toISOString(),
      total_tasks: enhancedTasks.length,
      smart_features: {
        due_dates: enhancedTasks.filter(t => t.due_date).length,
        priorities: {
          high: enhancedTasks.filter(t => t.priority === 'high').length,
          medium: enhancedTasks.filter(t => t.priority === 'medium').length,
          low: enhancedTasks.filter(t => t.priority === 'low').length
        },
        categories: this.getCategoryStats(enhancedTasks),
        deadline_status: this.getDeadlineStats(enhancedTasks)
      }
    };
    
    this.saveEnhancedTasks(result);
    
    console.log('✅ Smart Task Enhancement abgeschlossen!');
    console.log(`📊 ${enhancedTasks.length} Tasks erweitert`);
    console.log(`📅 ${result.smart_features.due_dates} Tasks mit Due Dates`);
    console.log(`🏷️  ${Object.keys(result.smart_features.categories).length} Kategorien`);
    
    return result;
  }

  // Kategorie-Statistiken
  getCategoryStats(tasks) {
    const stats = {};
    tasks.forEach(task => {
      stats[task.category] = (stats[task.category] || 0) + 1;
    });
    return stats;
  }

  // Deadline-Statistiken
  getDeadlineStats(tasks) {
    const stats = {};
    tasks.forEach(task => {
      stats[task.deadline_status] = (stats[task.deadline_status] || 0) + 1;
    });
    return stats;
  }
}

// Hauptfunktion
function main() {
  const enhancer = new SmartTaskEnhancer();
  const result = enhancer.enhanceAllTasks();
  
  console.log('\n📊 Smart Task Statistiken:');
  console.log(JSON.stringify(result.smart_features, null, 2));
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = SmartTaskEnhancer;
