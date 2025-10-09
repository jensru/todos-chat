// src/lib/services/DatabaseTaskService.ts - SQLite Database Task Service
import { PrismaClient } from '@prisma/client';
import { Task } from '@/lib/types';

export class DatabaseTaskService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async loadTasks(): Promise<Task[]> {
    try {
      console.log('DatabaseTaskService.loadTasks - loading from SQLite database...');
      
      const dbTasks = await this.prisma.task.findMany({
        orderBy: { globalPosition: 'asc' }
      });
      
      const tasks = dbTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        priority: task.priority,
        dueDate: task.dueDate,
        category: task.category,
        tags: JSON.parse(task.tags),
        subtasks: JSON.parse(task.subtasks),
        globalPosition: task.globalPosition,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
      
      console.log('DatabaseTaskService.loadTasks - loaded', tasks.length, 'tasks from database');
      return tasks;
    } catch (error) {
      console.error('DatabaseTaskService.loadTasks - error:', error);
      return [];
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      console.log('DatabaseTaskService.updateTask - updating task:', taskId, updates);
      
      const updateData: any = {
        ...updates,
        updatedAt: new Date()
      };
      
      // Handle JSON fields
      if (updates.tags) {
        updateData.tags = JSON.stringify(updates.tags);
      }
      if (updates.subtasks) {
        updateData.subtasks = JSON.stringify(updates.subtasks);
      }
      
      await this.prisma.task.update({
        where: { id: taskId },
        data: updateData
      });
      
      console.log('DatabaseTaskService.updateTask - task updated successfully');
      return true;
    } catch (error) {
      console.error('DatabaseTaskService.updateTask - error:', error);
      return false;
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      console.log('DatabaseTaskService.addTask - adding new task:', task.title);
      
      const newTask = await this.prisma.task.create({
        data: {
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: task.title,
          description: task.description || '',
          completed: task.completed || false,
          priority: task.priority || false,
          dueDate: task.dueDate || null,
          category: task.category || null,
          tags: JSON.stringify(task.tags || []),
          subtasks: JSON.stringify(task.subtasks || []),
          globalPosition: task.globalPosition || Date.now(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('DatabaseTaskService.addTask - task created with ID:', newTask.id);
      return true;
    } catch (error) {
      console.error('DatabaseTaskService.addTask - error:', error);
      return false;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      console.log('DatabaseTaskService.deleteTask - deleting task:', taskId);
      
      await this.prisma.task.delete({
        where: { id: taskId }
      });
      
      console.log('DatabaseTaskService.deleteTask - task deleted successfully');
      return true;
    } catch (error) {
      console.error('DatabaseTaskService.deleteTask - error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // Get task statistics
  getTaskStats(tasks: Task[]): { total: number; completed: number; active: number; highPriority: number; completionRate: number } {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    const highPriority = tasks.filter(task => task.priority).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      active,
      highPriority,
      completionRate
    };
  }

  // Group tasks by date
  getGroupedTasks(tasks: Task[]): Record<string, Task[]> {
    const grouped: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      const dateKey = task.dueDate ? 
        task.dueDate.toISOString().split('T')[0] : 
        'ohne-datum';
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });

    // Sort tasks within each group by globalPosition
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => a.globalPosition - b.globalPosition);
    });

    return grouped;
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateString === 'ohne-datum') {
      return 'Ohne Datum';
    }
    
    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    }
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Morgen';
    }
    
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Drag & Drop methods
  async reorderTasksWithinDate(dateKey: string, taskIds: string[]): Promise<boolean> {
    try {
      console.log('DatabaseTaskService.reorderTasksWithinDate - reordering tasks within date:', dateKey);
      
      // Update globalPosition for each task based on new order
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const baseTime = Date.now();
        const newPosition = baseTime + i;
        
        await this.prisma.task.update({
          where: { id: taskId },
          data: { 
            globalPosition: newPosition,
            updatedAt: new Date()
          }
        });
      }
      
      console.log('DatabaseTaskService.reorderTasksWithinDate - reordering completed');
      return true;
    } catch (error) {
      console.error('DatabaseTaskService.reorderTasksWithinDate - error:', error);
      return false;
    }
  }

  async moveTaskToDate(taskId: string, newDate: Date | null): Promise<boolean> {
    try {
      console.log('DatabaseTaskService.moveTaskToDate - moving task:', taskId, 'to date:', newDate);
      
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          dueDate: newDate,
          updatedAt: new Date()
        }
      });
      
      console.log('DatabaseTaskService.moveTaskToDate - task moved successfully');
      return true;
    } catch (error) {
      console.error('DatabaseTaskService.moveTaskToDate - error:', error);
      return false;
    }
  }

  async reorderTasksAcrossDates(taskId: string, targetDate: Date | null, targetIndex: number): Promise<boolean> {
    try {
      console.log('DatabaseTaskService.reorderTasksAcrossDates - moving task:', taskId, 'to date:', targetDate, 'at index:', targetIndex);
      
      // Update the task's dueDate and globalPosition
      const baseTime = Date.now();
      const newPosition = baseTime + targetIndex;
      
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          dueDate: targetDate,
          globalPosition: newPosition,
          updatedAt: new Date()
        }
      });
      
      console.log('DatabaseTaskService.reorderTasksAcrossDates - task moved successfully');
      return true;
    } catch (error) {
      console.error('DatabaseTaskService.reorderTasksAcrossDates - error:', error);
      return false;
    }
  }
}
