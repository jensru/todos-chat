// scripts/migrate-to-db.js - Migrate JSON data to SQLite database
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateTasks() {
  try {
    console.log('Starting migration from JSON to SQLite...');
    
    // Read JSON data
    const jsonPath = path.join(__dirname, '../public/data/smart-tasks-standardized.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const tasks = jsonData.tasks || [];
    
    console.log(`Found ${tasks.length} tasks to migrate`);
    
    // Clear existing tasks
    await prisma.task.deleteMany();
    console.log('Cleared existing tasks');
    
    // Insert tasks
    for (const task of tasks) {
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
          globalPosition: task.globalPosition || 0,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        }
      });
    }
    
    console.log(`✅ Successfully migrated ${tasks.length} tasks to SQLite database`);
    
    // Verify migration
    const count = await prisma.task.count();
    console.log(`Database now contains ${count} tasks`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateTasks();
