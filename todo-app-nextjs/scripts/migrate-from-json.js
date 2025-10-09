// scripts/migrate-from-json.js - Migrate tasks from JSON to Prisma DB
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateFromJSON() {
  try {
    console.log('🔄 Starting migration from JSON to Prisma DB...');

    // Read JSON file
    const jsonPath = path.join(__dirname, '../public/data/smart-tasks-standardized.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log(`📦 Found ${jsonData.tasks.length} tasks in JSON`);

    // Delete all existing tasks
    await prisma.task.deleteMany();
    console.log('🗑️  Cleared existing tasks');

    // Insert tasks
    let migrated = 0;
    for (const task of jsonData.tasks) {
      try {
        await prisma.task.create({
          data: {
            id: task.id,
            title: task.title,
            description: task.description || '',
            completed: task.completed || false,
            priority: task.priority || false,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            category: task.category || 'todo',
            tags: JSON.stringify(task.tags || []),
            subtasks: JSON.stringify(task.subtasks || []),
            globalPosition: task.globalPosition || Date.now() + migrated,
            createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
            updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
          },
        });
        migrated++;
      } catch (error) {
        console.error(`❌ Failed to migrate task ${task.id}:`, error.message);
      }
    }

    console.log(`✅ Successfully migrated ${migrated} tasks`);

    // Verify
    const count = await prisma.task.count();
    console.log(`✅ Verification: ${count} tasks in database`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateFromJSON()
  .then(() => {
    console.log('🎉 Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration error:', error);
    process.exit(1);
  });
