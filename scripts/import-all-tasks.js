#!/usr/bin/env node

/**
 * Vollständiger Import aller Tasks aus Git-Backup
 * Lädt ALLE Tasks aus data/smart-tasks.json in Supabase
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
const backupData = JSON.parse(fs.readFileSync('/tmp/all_tasks.json', 'utf8'));
const allTasks = backupData.tasks;

// Mapping-Funktion für alte zu neuer Struktur
function mapOldTaskToNew(oldTask, userId) {
  return {
    id: oldTask.id,
    userId: userId,
    title: oldTask.title,
    description: oldTask.description || '',
    notes: oldTask.notes || '',
    completed: oldTask.status === 'completed',
    priority: oldTask.priority === 'high',
    dueDate: oldTask.due_date || null,
    category: oldTask.category || null,
    tags: JSON.stringify(oldTask.tags || []),
    subtasks: JSON.stringify(oldTask.subtasks || []),
    globalPosition: oldTask.global_position || Date.now(),
    createdAt: oldTask.created_at || new Date().toISOString(),
    updatedAt: oldTask.updated_at || new Date().toISOString()
  };
}

async function importAllTasks() {
  try {
    console.log('🚀 Starte vollständigen Task-Import...');
    console.log(`📋 ${allTasks.length} Tasks gefunden im Backup`);
    
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
    
    // Alle Tasks importieren
    const mappedTasks = allTasks.map(task => mapOldTaskToNew(task, user.id));
    
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(mappedTasks)
      .select();
    
    if (insertError) {
      console.error('❌ Fehler beim Importieren:', insertError);
      return;
    }
    
    console.log(`✅ ${insertedTasks.length} Tasks erfolgreich importiert!`);
    
    // Statistiken nach Datum
    const today = new Date('2025-10-15');
    const futureTasks = insertedTasks.filter(t => t.dueDate && new Date(t.dueDate) > today);
    const pastTasks = insertedTasks.filter(t => t.dueDate && new Date(t.dueDate) <= today);
    const noDateTasks = insertedTasks.filter(t => !t.dueDate);
    
    const completed = insertedTasks.filter(t => t.completed).length;
    const pending = insertedTasks.filter(t => !t.completed).length;
    const highPriority = insertedTasks.filter(t => t.priority).length;
    
    console.log('\n📊 Vollständige Import-Statistiken:');
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
        .slice(0, 10)
        .forEach(task => {
          const date = new Date(task.dueDate).toLocaleDateString('de-DE');
          const status = task.completed ? '✅' : '⏳';
          const priority = task.priority ? '🔥' : '';
          console.log(`   ${status} ${task.title} (${date}) ${priority}`);
        });
      
      if (futureTasks.length > 10) {
        console.log(`   ... und ${futureTasks.length - 10} weitere`);
      }
    }
    
    console.log('\n🎉 Vollständiger Import abgeschlossen!');
    console.log('📧 Login mit: jensrusi@gmail.com');
    
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error);
  }
}

// Script ausführen
if (require.main === module) {
  importAllTasks();
}

module.exports = { importAllTasks };
