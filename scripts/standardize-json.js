#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the current JSON file
const inputPath = path.join(__dirname, '../todo-app-nextjs/public/data/smart-tasks.json');
const outputPath = path.join(__dirname, '../todo-app-nextjs/public/data/smart-tasks-standardized.json');

try {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  // Standardize the task format
  const standardizedTasks = data.tasks.map(task => {
    // Fix corrupted dates
    let fixedDueDate = task.due_date;
    if (fixedDueDate) {
      // Fix formats like "2025-95-01" -> "2025-09-01"
      if (fixedDueDate.match(/2025-9[5-9]-\d{2}/)) {
        fixedDueDate = fixedDueDate.replace(/2025-9[5-9]/, '2025-09');
      }
      // Fix formats like "2025-25-02" -> "2025-02-02"
      if (fixedDueDate.match(/2025-2[5-9]-\d{2}/)) {
        fixedDueDate = fixedDueDate.replace(/2025-2[5-9]/, '2025-02');
      }
    }
    
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      completed: task.status === 'completed' || task.completed === true,
      priority: task.priority || false,
      dueDate: fixedDueDate,
      category: task.category || null,
      tags: task.tags || [],
      subtasks: (task.subtasks || []).map(subtask => ({
        id: subtask.id,
        title: subtask.title,
        completed: subtask.completed || false
      })),
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      globalPosition: task.global_position || task.line_number || Date.now()
    };
  });
  
  // Create standardized structure
  const standardizedData = {
    tasks: standardizedTasks,
    metadata: {
      version: '2.0',
      lastUpdated: new Date().toISOString(),
      totalTasks: standardizedTasks.length,
      activeTasks: standardizedTasks.filter(t => !t.completed).length,
      completedTasks: standardizedTasks.filter(t => t.completed).length
    }
  };
  
  // Write standardized file
  fs.writeFileSync(outputPath, JSON.stringify(standardizedData, null, 2));
  
  console.log('✅ Standardisierte JSON erstellt:');
  console.log(`📁 Input: ${inputPath}`);
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📊 Total Tasks: ${standardizedData.metadata.totalTasks}`);
  console.log(`✅ Active Tasks: ${standardizedData.metadata.activeTasks}`);
  console.log(`✅ Completed Tasks: ${standardizedData.metadata.completedTasks}`);
  
} catch (error) {
  console.error('❌ Fehler beim Standardisieren:', error.message);
  process.exit(1);
}
