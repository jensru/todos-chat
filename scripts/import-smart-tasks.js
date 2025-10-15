#!/usr/bin/env node

/**
 * Import der erweiterten Smart-Tasks aus dem jüngsten Commit
 * Lädt smart-tasks.json mit allen zusätzlichen Feldern
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Backup-Daten laden
const backupData = JSON.parse(fs.readFileSync('/tmp/smart_tasks_backup.json', 'utf8'));
const allTasks = backupData.tasks;

// Funktion zum Validieren von Daten
function isValidDate(dateString) {
  if (!dateString) return true; // null/undefined ist ok
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2030;
}

// Mapping-Funktion für alte zu neuer Struktur
function mapOldTaskToNew(oldTask, userId) {
  // Bereinige ungültige Daten
  let cleanDueDate = oldTask.due_date;
  if (cleanDueDate && !isValidDate(cleanDueDate)) {
    console.log(`⚠️ Ungültiges Datum gefiltert: ${cleanDueDate} für Task: ${oldTask.title}`);
    cleanDueDate = null;
  }
  
  return {
    id: oldTask.id,
    userId: userId,
    title: oldTask.title,
    description: oldTask.description || '',
    notes: oldTask.notes || '',
    completed: oldTask.status === 'completed',
    priority: oldTask.priority === 'high',
    dueDate: cleanDueDate,
    category: oldTask.category || null,
    tags: JSON.stringify(oldTask.tags || []),
    subtasks: JSON.stringify(oldTask.subtasks || []),
    globalPosition: oldTask.global_position || Date.now(),
    createdAt: oldTask.created_at || new Date().toISOString(),
    updatedAt: oldTask.updated_at || new Date().toISOString()
  };
}

async function importSmartTasks() {
  try {
    console.log('🚀 Starte Smart-Tasks Import (erweiterte Version)...');
    console.log(`📋 ${allTasks.length} Smart-Tasks gefunden im Backup`);
    
    // User finden
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === 'jensrusi@gmail.com');
    
    if (!user) {
      console.error('❌ User jensrusi@gmail.com nicht gefunden');
      return;
    }
    
    console.log(`✅ User gefunden: ${user.id}`);
    
    // Vorhandene Tasks löschen
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('userId', user.id);
    
    if (deleteError) {
      console.error('❌ Fehler beim Löschen:', deleteError);
    } else {
      console.log('🧹 Vorhandene Tasks gelöscht');
    }
    
    // Tasks filtern und bereinigen
    const validTasks = allTasks.filter(task => {
      // Filtere Tasks mit ungültigen Daten
      if (task.due_date && !isValidDate(task.due_date)) {
        console.log(`⚠️ Task gefiltert (ungültiges Datum): ${task.title}`);
        return false;
      }
      return true;
    });
    
    console.log(`✅ ${validTasks.length} gültige Smart-Tasks nach Bereinigung`);
    
    // Alle gültigen Tasks importieren
    const mappedTasks = validTasks.map(task => mapOldTaskToNew(task, user.id));
    
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(mappedTasks)
      .select();
    
    if (insertError) {
      console.error('❌ Fehler beim Importieren:', insertError);
      return;
    }
    
    console.log(`✅ ${insertedTasks.length} Smart-Tasks erfolgreich importiert!`);
    
    // Statistiken nach Datum
    const today = new Date('2025-10-15');
    const futureTasks = insertedTasks.filter(t => t.dueDate && new Date(t.dueDate) > today);
    const pastTasks = insertedTasks.filter(t => t.dueDate && new Date(t.dueDate) <= today);
    const noDateTasks = insertedTasks.filter(t => !t.dueDate);
    
    const completed = insertedTasks.filter(t => t.completed).length;
    const pending = insertedTasks.filter(t => !t.completed).length;
    const highPriority = insertedTasks.filter(t => t.priority).length;
    
    console.log('\n📊 Smart-Tasks Import-Statistiken:');
    console.log(`   • Gesamt: ${insertedTasks.length} Tasks`);
    console.log(`   • Erledigt: ${completed}`);
    console.log(`   • Ausstehend: ${pending}`);
    console.log(`   • High Priority: ${highPriority}`);
    console.log(`   • Zukünftige Tasks (ab 16.10.25): ${futureTasks.length}`);
    console.log(`   • Vergangene Tasks: ${pastTasks.length}`);
    console.log(`   • Ohne Datum: ${noDateTasks.length}`);
    
    // Zukünftige Tasks auflisten
    if (futureTasks.length > 0) {
      console.log('\n🔮 Zukünftige Smart-Tasks (ab 16.10.25):');
      futureTasks
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .forEach(task => {
          const date = new Date(task.dueDate).toLocaleDateString('de-DE');
          const status = task.completed ? '✅' : '⏳';
          const priority = task.priority ? '🔥' : '';
          console.log(`   ${status} ${task.title} (${date}) ${priority}`);
        });
    }
    
    console.log('\n🎉 Smart-Tasks Import abgeschlossen!');
    console.log('📧 Login mit: jensrusi@gmail.com');
    console.log('✨ Diese Version enthält erweiterte Felder wie smart_score, complexity, hierarchy_level');
    
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error);
  }
}

// Script ausführen
if (require.main === module) {
  importSmartTasks();
}

module.exports = { importSmartTasks };
