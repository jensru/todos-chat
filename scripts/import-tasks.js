#!/usr/bin/env node

/**
 * Import Script für alte Tasks aus Git-Backup
 * Lädt Tasks aus data/tasks.json und data/smart-tasks.json in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Backup-Daten aus Git-Commits
const backupTasks = [
  // Aus data/tasks.json (Commit 7bf7b69)
  {
    "id": "task_1759845284651_lululbullu",
    "title": "lululbullu",
    "category": "todo",
    "status": "completed",
    "priority": "medium",
    "due_date": "2023-10-07",
    "created_at": "2025-10-07T13:54:44.651Z",
    "updated_at": "2025-10-07T14:24:10.591Z",
    "global_position": 1
  },
  {
    "id": "task_unknown_steffen_app_schicken___develop_3",
    "title": "Steffen app schicken 📁 Development",
    "description": "",
    "status": "completed",
    "priority": "medium",
    "category": "Development",
    "tags": [],
    "due_date": "2025-10-06",
    "created_at": "2025-10-07T11:51:41.705Z",
    "updated_at": "2025-10-07T11:51:41.705Z",
    "global_position": 2
  },
  {
    "id": "task_unknown_pascal_antworten_4",
    "title": "Pascal antworten",
    "description": "",
    "status": "completed",
    "priority": "medium",
    "category": "Business",
    "tags": [],
    "due_date": "2025-10-06",
    "created_at": "2025-10-07T11:51:41.705Z",
    "updated_at": "2025-10-07T12:05:05.790Z",
    "global_position": 3
  },
  {
    "id": "task_1759850980710_pr_sentation_zusamme",
    "title": "Präsentation zusammen bauen",
    "category": "Push Konferenz",
    "status": "completed",
    "priority": "high",
    "due_date": "2025-10-07",
    "created_at": "2025-10-07T15:29:40.710Z",
    "updated_at": "2025-10-07T15:58:55.818Z",
    "global_position": 4
  },
  {
    "id": "task_unknown_tim_wg__coaching____urgent_9",
    "title": "Tim wg. Coaching 🔥 📁 Urgent",
    "description": "",
    "status": "completed",
    "priority": "high",
    "category": "Urgent",
    "tags": ["urgent"],
    "due_date": "2025-10-07",
    "created_at": "2025-10-07T11:51:41.705Z",
    "updated_at": "2025-10-07T11:51:41.705Z",
    "global_position": 5
  },
  {
    "id": "task_unknown_pascak_anrufen____business_10",
    "title": "Pascak anrufen 🔥 📁 Business",
    "description": "",
    "status": "completed",
    "priority": "high",
    "category": "Check24",
    "tags": ["urgent", "business"],
    "due_date": "2025-10-07",
    "created_at": "2025-10-07T11:51:41.705Z",
    "updated_at": "2025-10-07T13:36:44.842Z",
    "global_position": 6
  },
  {
    "id": "task_unknown___linkend_in_post_____i_m_back_14",
    "title": "Linkend In Post - I am back at preparing my breakout session for PUSH...",
    "description": "",
    "status": "completed",
    "priority": "high",
    "category": "Werbung",
    "tags": ["urgent", "PUSH", "social-media"],
    "due_date": "2025-10-07",
    "created_at": "2025-10-07T11:51:41.706Z",
    "updated_at": "2025-10-07T14:20:14.840Z",
    "global_position": 7
  },
  {
    "id": "task_1759844468680__ber_meine_chat_firs",
    "title": "Über meine chat first todo liste schreiben",
    "category": "Werbung",
    "due_date": "2025-10-08",
    "priority": "high",
    "created_at": "2025-10-07T13:41:08.680Z",
    "updated_at": "2025-10-08T12:18:34.076Z",
    "status": "completed",
    "global_position": 12
  },
  {
    "id": "task_1759905558487_check24_termin_schic",
    "title": "Check24 Termin schicken",
    "category": "Check24",
    "priority": "high",
    "due_date": "2025-10-08",
    "created_at": "2025-10-08T06:39:18.487Z",
    "updated_at": "2025-10-08T12:58:06.043Z",
    "status": "completed",
    "global_position": 13
  },
  {
    "id": "task_1759912879200_todolist_mit_meinem_",
    "title": "Todolist mit meinem chatfirst prompt",
    "category": "General",
    "status": "completed",
    "priority": "high",
    "due_date": "2025-10-08",
    "created_at": "2025-10-08T08:41:19.200Z",
    "updated_at": "2025-10-08T12:18:36.938Z",
    "global_position": 14
  },
  {
    "id": "task_1759854607985_storyline_exakt_pr_f",
    "title": "Storyline exakt prüfen",
    "category": "Push Konferenz",
    "status": "pending",
    "priority": "high",
    "due_date": "2025-10-09",
    "created_at": "2025-10-07T16:30:07.985Z",
    "updated_at": "2025-10-08T16:21:24.254Z",
    "global_position": 21
  },
  {
    "id": "task_1759913008291_storyline_check24",
    "title": "Storyline check24",
    "category": "Check24",
    "priority": "high",
    "due_date": "2025-10-09",
    "created_at": "2025-10-08T08:43:28.291Z",
    "updated_at": "2025-10-08T16:21:10.990Z",
    "global_position": 22
  },
  {
    "id": "task_1759928104997_3_alte_kontakte_auf_",
    "title": "3 alte Kontakte auf LinkedIn anschreiben",
    "category": "General",
    "status": "pending",
    "priority": "medium",
    "due_date": "2025-10-09",
    "created_at": "2025-10-08T12:55:04.997Z",
    "updated_at": "2025-10-08T12:55:04.997Z",
    "global_position": 23
  },
  {
    "id": "task_1759928339325_pascal_fragen_ob_mon",
    "title": "Pascal fragen ob Montag oder Dienstag schon mal 30 min vorbei für Dinge checken geht, wenn es geht Termin mit Fabian ausmachen",
    "category": "Check24",
    "status": "pending",
    "priority": "medium",
    "due_date": "2025-10-09",
    "created_at": "2025-10-08T12:58:59.325Z",
    "updated_at": "2025-10-08T12:59:45.450Z",
    "global_position": 24
  },
  {
    "id": "task_1759931935850_quartalssteuereinrei",
    "title": "quartalssteuereinreichen morgen machen",
    "category": "General",
    "status": "pending",
    "priority": "medium",
    "due_date": "2025-10-09",
    "created_at": "2025-10-08T13:58:55.852Z",
    "updated_at": "2025-10-08T13:59:44.647Z",
    "global_position": 25
  },
  {
    "id": "task_1759931935877_schreibtisch_zettel_",
    "title": "schreibtisch zettel machen morgen",
    "category": "General",
    "status": "pending",
    "priority": "medium",
    "due_date": "2025-10-09",
    "created_at": "2025-10-08T13:58:55.877Z",
    "updated_at": "2025-10-08T13:59:51.279Z",
    "global_position": 26
  },
  {
    "id": "task_1759905434846_slk_testfahren",
    "title": "SLK testfahren",
    "category": "General",
    "status": "pending",
    "priority": "medium",
    "due_date": "2025-10-10",
    "created_at": "2025-10-08T06:37:14.846Z",
    "updated_at": "2025-10-08T06:37:14.846Z",
    "global_position": 38
  },
  {
    "id": "task_1759913089441_werk1",
    "title": "werk1 1/3",
    "category": "Business",
    "status": "pending",
    "priority": "medium",
    "due_date": "2025-10-10",
    "created_at": "2025-10-08T08:44:49.441Z",
    "updated_at": "2025-10-08T16:09:56.004Z",
    "global_position": 39
  },
  {
    "id": "task_1759851076117_grafikstil_prompten_",
    "title": "Alle slides und storyline checken",
    "category": "Push Konferenz",
    "status": "pending",
    "priority": "high",
    "due_date": "2025-10-14",
    "created_at": "2025-10-07T15:31:16.118Z",
    "updated_at": "2025-10-07T16:01:25.558Z",
    "global_position": 53
  }
];

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

async function importTasks() {
  try {
    console.log('🚀 Starte Task-Import...');
    
    // Erstelle einen Test-User (falls noch nicht vorhanden)
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword123',
      email_confirm: true
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Fehler beim Erstellen des Test-Users:', authError);
      return;
    }

    const userId = user?.id;
    if (!userId) {
      console.error('❌ Keine User-ID verfügbar');
      return;
    }

    console.log(`✅ Test-User erstellt/gefunden: ${userId}`);

    // Lösche vorhandene Tasks für diesen User
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('userId', userId);

    if (deleteError) {
      console.error('❌ Fehler beim Löschen vorhandener Tasks:', deleteError);
    } else {
      console.log('🧹 Vorhandene Tasks gelöscht');
    }

    // Importiere Tasks
    const mappedTasks = backupTasks.map(task => mapOldTaskToNew(task, userId));
    
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(mappedTasks)
      .select();

    if (insertError) {
      console.error('❌ Fehler beim Importieren der Tasks:', insertError);
      return;
    }

    console.log(`✅ ${insertedTasks.length} Tasks erfolgreich importiert!`);
    
    // Zeige Statistiken
    const completed = insertedTasks.filter(t => t.completed).length;
    const pending = insertedTasks.filter(t => !t.completed).length;
    const highPriority = insertedTasks.filter(t => t.priority).length;
    
    console.log('\n📊 Import-Statistiken:');
    console.log(`   • Gesamt: ${insertedTasks.length} Tasks`);
    console.log(`   • Erledigt: ${completed}`);
    console.log(`   • Ausstehend: ${pending}`);
    console.log(`   • High Priority: ${highPriority}`);
    
    console.log('\n🎉 Import abgeschlossen! Du kannst jetzt in der App einloggen.');
    console.log('📧 E-Mail: test@example.com');
    console.log('🔑 Passwort: testpassword123');

  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error);
  }
}

// Script ausführen
if (require.main === module) {
  importTasks();
}

module.exports = { importTasks, mapOldTaskToNew };
