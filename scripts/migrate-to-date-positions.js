// scripts/migrate-to-date-positions.js - Migrate to date-based positioning
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToDatePositions() {
  try {
    console.log('Starting migration to date-based positioning...');
    
    // Get all tasks
    const tasks = await prisma.task.findMany({
      orderBy: { globalPosition: 'asc' }
    });
    
    console.log(`Found ${tasks.length} tasks to migrate`);
    
    // Group tasks by date
    const tasksByDate = {};
    
    tasks.forEach(task => {
      const dateKey = task.dueDate ? 
        task.dueDate.toISOString().split('T')[0] : 
        'ohne-datum';
      
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });
    
    console.log('Grouped tasks by date:', Object.keys(tasksByDate));
    
    // Assign new date-based positions
    for (const [dateKey, dateTasks] of Object.entries(tasksByDate)) {
      const dateString = dateKey === 'ohne-datum' ? '999999' : dateKey.replace(/-/g, '');
      
      console.log(`Processing date ${dateKey} (${dateString}) with ${dateTasks.length} tasks`);
      
      for (let i = 0; i < dateTasks.length; i++) {
        const task = dateTasks[i];
        const positionInDate = String(i + 1).padStart(2, '0');
        const newPosition = parseInt(dateString + positionInDate);
        
        await prisma.task.update({
          where: { id: task.id },
          data: { 
            globalPosition: newPosition,
            updatedAt: new Date()
          }
        });
        
        console.log(`Migrated task ${task.id} (${task.title}) from position ${task.globalPosition} to ${newPosition}`);
      }
    }
    
    console.log('✅ Migration to date-based positioning completed successfully');
    
    // Verify migration
    const migratedTasks = await prisma.task.findMany({
      orderBy: { globalPosition: 'asc' }
    });
    
    console.log('Verification - first few tasks:');
    migratedTasks.slice(0, 5).forEach(task => {
      const dateKey = task.dueDate ? 
        task.dueDate.toISOString().split('T')[0] : 
        'ohne-datum';
      console.log(`- ${task.title} (${dateKey}): position ${task.globalPosition}`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToDatePositions();
