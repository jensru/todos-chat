#!/usr/bin/env node

/**
 * Migration Script: SQLite zu Supabase PostgreSQL
 * Migriert alle Tasks aus der lokalen SQLite-DB zu Supabase mit einem User
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Konfiguration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_EMAIL = process.env.MIGRATION_USER_EMAIL || 'admin@example.com';
const USER_PASSWORD = process.env.MIGRATION_USER_PASSWORD || 'admin123';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Fehler: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrateTasks() {
  console.log('🚀 Starte Migration von SQLite zu Supabase...');
  
  try {
    // 1. Lade alle Tasks aus SQLite
    console.log('📖 Lade Tasks aus SQLite...');
    const sqlitePrisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./prisma/dev.db'
        }
      }
    });

    const sqliteTasks = await sqlitePrisma.task.findMany({
      orderBy: { globalPosition: 'asc' }
    });

    console.log(`✅ ${sqliteTasks.length} Tasks aus SQLite geladen`);

    // 2. Erstelle oder hole User in Supabase
    console.log('👤 Erstelle User in Supabase...');
    
    // Versuche User zu erstellen
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: USER_EMAIL,
      password: USER_PASSWORD,
      email_confirm: true
    });

    let userId;
    if (authError && authError.message.includes('already registered')) {
      console.log('👤 User existiert bereits, hole User-ID...');
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const user = existingUser.users.find(u => u.email === USER_EMAIL);
      if (user) {
        userId = user.id;
        console.log(`✅ User gefunden: ${user.email} (${userId})`);
      } else {
        throw new Error('User nicht gefunden');
      }
    } else if (authError) {
      throw authError;
    } else {
      userId = authData.user.id;
      console.log(`✅ User erstellt: ${authData.user.email} (${userId})`);
    }

    // 3. Erstelle PostgreSQL Prisma Client für Supabase
    console.log('🔗 Verbinde mit Supabase PostgreSQL...');
    const postgresPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // 4. Migriere Tasks
    console.log('📦 Migriere Tasks...');
    let migratedCount = 0;
    let errorCount = 0;

    for (const task of sqliteTasks) {
      try {
        await postgresPrisma.task.create({
          data: {
            id: task.id,
            userId: userId,
            title: task.title,
            description: task.description,
            notes: task.notes,
            completed: task.completed,
            priority: task.priority,
            dueDate: task.dueDate,
            category: task.category,
            tags: task.tags,
            subtasks: task.subtasks,
            globalPosition: task.globalPosition,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
          }
        });
        migratedCount++;
        if (migratedCount % 10 === 0) {
          console.log(`📦 ${migratedCount}/${sqliteTasks.length} Tasks migriert...`);
        }
      } catch (error) {
        console.error(`❌ Fehler beim Migrieren von Task ${task.id}:`, error);
        errorCount++;
      }
    }

    // 5. Verifikation
    console.log('🔍 Verifiziere Migration...');
    const migratedTasks = await postgresPrisma.task.findMany({
      where: { userId: userId },
      orderBy: { globalPosition: 'asc' }
    });

    console.log('\n📊 Migration Zusammenfassung:');
    console.log(`✅ Erfolgreich migriert: ${migratedCount}`);
    console.log(`❌ Fehler: ${errorCount}`);
    console.log(`📋 Gesamt in Supabase: ${migratedTasks.length}`);
    console.log(`📋 Original SQLite: ${sqliteTasks.length}`);

    if (migratedTasks.length === sqliteTasks.length) {
      console.log('🎉 Migration erfolgreich abgeschlossen!');
    } else {
      console.log('⚠️  Migration unvollständig - bitte prüfen');
    }

    // 6. Cleanup
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();

    // 7. Erstelle Backup-Report
    const report = {
      timestamp: new Date().toISOString(),
      originalCount: sqliteTasks.length,
      migratedCount: migratedCount,
      errorCount: errorCount,
      finalCount: migratedTasks.length,
      userId: userId,
      userEmail: USER_EMAIL
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'migration-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('📄 Migration-Report gespeichert: migration-report.json');

  } catch (error) {
    console.error('💥 Migration fehlgeschlagen:', error);
    process.exit(1);
  }
}

// Script ausführen
if (require.main === module) {
  migrateTasks()
    .then(() => {
      console.log('✅ Migration-Script beendet');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration-Script fehlgeschlagen:', error);
      process.exit(1);
    });
}

export { migrateTasks };
