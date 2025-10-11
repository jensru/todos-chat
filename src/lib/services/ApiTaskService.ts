// src/lib/services/ApiTaskService.ts - API-based Task Service
import { Task } from '@/lib/types';

export class ApiTaskService {
  async loadTasks(): Promise<Task[]> {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      
      const data = await response.json();
      
      const tasks = (data.tasks || []).map((task: any) => {
        // Parse dueDate as local date, not UTC
        let dueDate = null;
        if (task.dueDate) {
          // If it's a datetime string like "2025-10-13T00:00:00" or date "2025-10-13", parse as local
          if (typeof task.dueDate === 'string') {
            const dateMatch = task.dueDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (dateMatch) {
              const [, year, month, day] = dateMatch;
              dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
              dueDate = new Date(task.dueDate);
            }
          } else {
            dueDate = new Date(task.dueDate);
          }
        }

        const convertedTask = {
          ...task,
          dueDate,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt)
        };
        // Debug log removed to prevent console spam
        return convertedTask;
      });
      
      // Loaded tasks from API
      return tasks;
    } catch (error) {
      console.error('ApiTaskService.loadTasks - error:', error);
      return [];
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      console.log('ApiTaskService.updateTask - updating task:', taskId, updates);
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const result = await response.json();
      console.log('ApiTaskService.updateTask - task updated successfully');
      return result.success;
    } catch (error) {
      console.error('ApiTaskService.updateTask - error:', error);
      return false;
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      console.log('ApiTaskService.addTask - adding new task:', task.title);
      
      // Calculate date-based position for new task
      let dateKey = 'ohne-datum';
      if (task.dueDate) {
        try {
          // Ensure dueDate is a valid Date object
          const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
          if (!isNaN(dueDate.getTime())) {
            dateKey = dueDate.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('Invalid dueDate in addTask:', task.dueDate, error);
        }
      }
      const dateString = dateKey === 'ohne-datum' ? '999999' : dateKey.replace(/-/g, '');
      const positionInDate = String(99).padStart(2, '0'); // Place at end of date group
      const globalPosition = parseInt(dateString + positionInDate);
      
      const taskWithPosition = {
        ...task,
        globalPosition
      };
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskWithPosition),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }

      const result = await response.json();
      console.log('ApiTaskService.addTask - task created successfully');
      return result.success;
    } catch (error) {
      console.error('ApiTaskService.addTask - error:', error);
      return false;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      console.log('ApiTaskService.deleteTask - deleting task:', taskId);
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      const result = await response.json();
      console.log('ApiTaskService.deleteTask - task deleted successfully');
      return result.success;
    } catch (error) {
      console.error('ApiTaskService.deleteTask - error:', error);
      return false;
    }
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
      // Use local date instead of UTC to avoid timezone offset issues
      const dateKey = task.dueDate ?
        `${task.dueDate.getFullYear()}-${String(task.dueDate.getMonth() + 1).padStart(2, '0')}-${String(task.dueDate.getDate()).padStart(2, '0')}` :
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
      console.log('ApiTaskService.reorderTasksWithinDate - reordering tasks within date:', dateKey);
      
      // Calculate date-based position
      const dateString = dateKey === 'ohne-datum' ? '999999' : dateKey.replace(/-/g, '');
      
      // Update globalPosition for each task based on new order within the date
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const positionInDate = String(i + 1).padStart(2, '0');
        const newPosition = parseInt(dateString + positionInDate);
        
        const success = await this.updateTask(taskId, { globalPosition: newPosition });
        if (!success) {
          return false;
        }
      }
      
      console.log('ApiTaskService.reorderTasksWithinDate - reordering completed');
      return true;
    } catch (error) {
      console.error('ApiTaskService.reorderTasksWithinDate - error:', error);
      return false;
    }
  }

  async moveTaskToDate(taskId: string, newDate: Date | null): Promise<boolean> {
    try {
      console.log('ApiTaskService.moveTaskToDate - moving task:', taskId, 'to date:', newDate);
      
      const success = await this.updateTask(taskId, { dueDate: newDate || undefined });
      console.log('ApiTaskService.moveTaskToDate - task moved successfully');
      return success;
    } catch (error) {
      console.error('ApiTaskService.moveTaskToDate - error:', error);
      return false;
    }
  }

  async reorderTasksAcrossDates(taskId: string, targetDate: Date | null, targetIndex: number): Promise<boolean> {
    try {
      console.log('ApiTaskService.reorderTasksAcrossDates - moving task:', taskId, 'to date:', targetDate, 'at index:', targetIndex);
      
      // Calculate date-based position
      const dateKey = targetDate ? targetDate.toISOString().split('T')[0] : 'ohne-datum';
      const dateString = dateKey === 'ohne-datum' ? '999999' : dateKey.replace(/-/g, '');
      const positionInDate = String(targetIndex + 1).padStart(2, '0');
      const newPosition = parseInt(dateString + positionInDate);
      
      const success = await this.updateTask(taskId, {
        dueDate: targetDate || undefined,
        globalPosition: newPosition
      });
      
      console.log('ApiTaskService.reorderTasksAcrossDates - task moved successfully');
      return success;
    } catch (error) {
      console.error('ApiTaskService.reorderTasksAcrossDates - error:', error);
      return false;
    }
  }
}
