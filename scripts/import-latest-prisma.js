#!/usr/bin/env node

/**
 * Import der neuesten Prisma SQLite-Datenbank Tasks
 * Konvertiert das Prisma-Schema zu Supabase-Schema (aktuelle Struktur)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Prisma Tasks aus SQLite-Dump laden
const prismaTasksRaw = fs.readFileSync('/tmp/prisma_tasks_latest.txt', 'utf8');
const prismaTasks = prismaTasksRaw.trim().split('\n').map(line => {
  const parts = line.split('|');
  
  // Sichere Datum-Parsing-Funktion
  const parseTimestamp = (timestamp) => {
    if (!timestamp) return new Date().toISOString();
    try {
      const date = new Date(parseInt(timestamp));
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    } catch (error) {
      console.warn('Invalid timestamp:', timestamp);
      return new Date().toISOString();
    }
  };
  
  return {
    id: parts[0],
    title: parts[1],
    description: parts[2] || '',
    completed: parts[3] === '1',
    priority: parts[4] === '1', // Boolean zu Boolean
    dueDate: parts[5] ? new Date(parseInt(parts[5])).toISOString().split('T')[0] : null, // Timestamp zu Date
    category: parts[6] || 'General',
    tags: parts[7] || '[]',
    subtasks: parts[8] || '[]',
    createdAt: parseTimestamp(parts[9]),
    updatedAt: parseTimestamp(parts[10]),
    globalPosition: parts[11] ? parseFloat(parts[11]) : Date.now()
  };
});

// Funktion zum Validieren von Daten
function isValidDate(dateString) {
  if (!dateString) return true; // null/undefined ist ok
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2030;
}

// Mapping-Funktion für Prisma zu Supabase (aktuelle Struktur)
function mapPrismaTaskToSupabase(prismaTask, userId) {
  // Bereinige ungültige Daten
  let cleanDueDate = prismaTask.dueDate;
  if (cleanDueDate && !isValidDate(cleanDueDate)) {
    console.log(`⚠️ Ungültiges Datum gefiltert: ${cleanDueDate} für Task: ${prismaTask.title}`);
    cleanDueDate = null;
  }
  
  return {
    id: prismaTask.id,
    userId: userId,
    title: prismaTask.title,
    description: prismaTask.description || '',
    notes: '', // Prisma hatte kein notes Feld, Supabase erwartet es
    completed: prismaTask.completed,
    priority: prismaTask.priority,
    dueDate: cleanDueDate,
    category: prismaTask.category === 'todo' ? null : prismaTask.category,
    tags: prismaTask.tags,
    subtasks: prismaTask.subtasks,
    globalPosition: prismaTask.globalPosition || Date.now(),
    createdAt: prismaTask.createdAt,
    updatedAt: prismaTask.updatedAt
  };
}

async function importLatestPrismaTasks() {
  try {
    console.log('🚀 Starte Import der neuesten Prisma SQLite-Datenbank...');
    console.log(`📋 ${prismaTasks.length} Prisma-Tasks gefunden`);
    
    // User finden
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === 'jensrusi@gmail.com');
    
    if (!user) {
      console.error('❌ User jensrusi@gmail.com nicht gefunden');
      return;
    }
    
    console.log(`✅ User gefunden: ${user.id}`);
    
    // Tasks filtern und bereinigen
    const validTasks = prismaTasks.filter(task => {
      // Filtere Tasks mit ungültigen Daten
      if (task.dueDate && !isValidDate(task.dueDate)) {
        console.log(`⚠️ Task gefiltert (ungültiges Datum): ${task.title}`);
        return false;
      }
      return true;
    });
    
    console.log(`✅ ${validTasks.length} gültige Prisma-Tasks nach Bereinigung`);
    
    // Alle gültigen Tasks importieren
    const mappedTasks = validTasks.map(task => mapPrismaTaskToSupabase(task, user.id));
    
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(mappedTasks)
      .select();
    
    if (insertError) {
      console.error('❌ Fehler beim Importieren:', insertError);
      return;
    }
    
    console.log(`✅ ${insertedTasks.length} Prisma-Tasks erfolgreich importiert!`);
    
    // Statistiken nach Datum
    const today = new Date('2025-10-15');
    const futureTasks = insertedTasks.filter(t => t.dueDate && new Date(t.dueDate) > today);
    const pastTasks = insertedTasks.filter(t => t.dueDate && new Date(t.dueDate) <= today);
    const noDateTasks = insertedTasks.filter(t => !t.dueDate);
    
    const completed = insertedTasks.filter(t => t.completed).length;
    const pending = insertedTasks.filter(t => !t.completed).length;
    const highPriority = insertedTasks.filter(t => t.priority).length;
    
    console.log('\n📊 Neueste Prisma-Tasks Import-Statistiken:');
    console.log(`   • Gesamt: ${insertedTasks.length} Tasks`);
    console.log(`   • Erledigt: ${completed}`);
    console.log(`   • Ausstehend: ${pending}`);
    console.log(`   • High Priority: ${highPriority}`);
    console.log(`   • Zukünftige Tasks (ab 16.10.25): ${futureTasks.length}`);
    console.log(`   • Vergangene Tasks: ${pastTasks.length}`);
    console.log(`   • Ohne Datum: ${noDateTasks.length}`);
    
    // Zukünftige Tasks auflisten
    if (futureTasks.length > 0) {
      console.log('\n🔮 Zukünftige Tasks (ab 16.10.25):');
      futureTasks
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .forEach(task => {
          const date = new Date(task.dueDate).toLocaleDateString('de-DE');
          const status = task.completed ? '✅' : '⏳';
          const priority = task.priority ? '🔥' : '';
          console.log(`   ${status} ${task.title} (${date}) ${priority}`);
        });
    }
    
    console.log('\n🎉 Neueste Prisma SQLite Import abgeschlossen!');
    console.log('📧 Login mit: jensrusi@gmail.com');
    console.log('🗄️ Diese Version kommt aus der neuesten Prisma-Datenbank (9. Oktober 2025)');
    console.log('✨ Korrekte Supabase-Struktur mit allen erforderlichen Feldern');
    
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error);
  }
}

// Script ausführen
if (require.main === module) {
  importLatestPrismaTasks();
}

module.exports = { importLatestPrismaTasks };
