// src/lib/services/TaskService.ts - Professional Task Service
import { Task } from '@/lib/types';

export class TaskService {
  private tasks: Task[] = [];
  private storageKey = 'todo-app-tasks';

  async loadTasks(): Promise<Task[]> {
    try {
      console.log('TaskService.loadTasks - loading from JSON file...');
      const response = await fetch('/data/smart-tasks-standardized.json');
      
      if (response.ok) {
        const data = await response.json();
        this.tasks = this.parseTasks(data.tasks || []);
        console.log('TaskService.loadTasks - loaded from JSON:', this.tasks.length, 'tasks');
        
        // Apply LocalStorage changes on top of fresh data
        if (typeof window !== 'undefined') {
          const localData = localStorage.getItem(this.storageKey);
          if (localData) {
            const parsedData = JSON.parse(localData);
            if (parsedData.tasks && parsedData.tasks.length > 0) {
              console.log('TaskService.loadTasks - found localStorage data:', parsedData.tasks.length, 'tasks');
              // Merge LocalStorage changes with fresh data
              const localTasks = this.parseTasks(parsedData.tasks);
              this.tasks = this.mergeTasks(this.tasks, localTasks);
              console.log('TaskService.loadTasks - merged with localStorage:', this.tasks.length, 'tasks');
            } else {
              console.log('TaskService.loadTasks - no localStorage data found');
            }
          } else {
            console.log('TaskService.loadTasks - no localStorage key found');
          }
        }
      } else {
        console.log('TaskService.loadTasks - failed to load JSON file');
        this.tasks = [];
      }
      return this.tasks;
    } catch (error) {
      console.log('TaskService.loadTasks - error:', error);
      this.tasks = [];
      return [];
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      const taskIndex = this.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          ...updates,
          updatedAt: new Date()
        };
        
        await this.saveTasks();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        globalPosition: task.globalPosition || Date.now()
      };
      
      this.tasks.push(newTask);
      await this.saveTasks();
      return true;
    } catch {
      return false;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const taskIndex = this.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasks.splice(taskIndex, 1);
        await this.saveTasks();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  getTasksSortedByDateAndPosition(): Task[] {
    return this.tasks
      .filter(task => !task.completed)
      .sort((a, b) => {
        // 1. Sort by date
        const dateA = a.dueDate ? a.dueDate.toISOString().split('T')[0] : 'ohne-datum';
        const dateB = b.dueDate ? b.dueDate.toISOString().split('T')[0] : 'ohne-datum';
        
        if (dateA !== dateB) {
          if (dateA === 'ohne-datum') return 1;
          if (dateB === 'ohne-datum') return -1;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        }
        
        // 2. Sort by global position only (priority is handled by user drag & drop)
        return a.globalPosition - b.globalPosition;
      });
  }

  getCategories(): string[] {
    const categories = [...new Set(this.tasks.map(task => task.category).filter(Boolean))];
    return categories.sort();
  }

  getTaskStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(task => task.completed).length;
    const active = total - completed;
    const highPriority = this.tasks.filter(task => task.priority && !task.completed).length;
    
    return {
      total,
      completed,
      active,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  clearLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  // Drag & Drop Methods
  async reorderTasksWithinDate(dateKey: string, taskIds: string[]): Promise<boolean> {
    try {
      console.log('reorderTasksWithinDate called:', { dateKey, taskIds });
      
      // Update global positions based on new order
      const baseTime = Date.now();
      taskIds.forEach((taskId, index) => {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
          const oldPosition = task.globalPosition;
          task.globalPosition = baseTime + index;
          task.updatedAt = new Date();
          console.log(`Updated task ${taskId}: ${oldPosition} -> ${task.globalPosition}`);
        }
      });

      await this.saveTasks();
      console.log('Tasks saved successfully');
      return true;
    } catch (error) {
      console.error('Error in reorderTasksWithinDate:', error);
      return false;
    }
  }

  async moveTaskToDate(taskId: string, newDate: Date | null): Promise<boolean> {
    try {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return false;

      // Update task date and position
      task.dueDate = newDate;
      task.globalPosition = Date.now();
      task.updatedAt = new Date();

      await this.saveTasks();
      return true;
    } catch {
      return false;
    }
  }

  async reorderTasksAcrossDates(taskId: string, targetDate: Date | null, targetIndex: number): Promise<boolean> {
    try {
      console.log('TaskService.reorderTasksAcrossDates called:', { taskId, targetDate, targetIndex });
      
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return false;

      // Update task date
      task.dueDate = targetDate;
      task.updatedAt = new Date();

      // Get all tasks for the target date (excluding the moving task)
      const targetDateTasks = this.tasks.filter(t => {
        if (t.completed || t.id === taskId) return false;
        const taskDate = t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'ohne-datum';
        const targetDateKey = targetDate ? targetDate.toISOString().split('T')[0] : 'ohne-datum';
        return taskDate === targetDateKey;
      });

      // Sort by current global position
      targetDateTasks.sort((a, b) => a.globalPosition - b.globalPosition);

      console.log('Target date tasks before insert:', targetDateTasks.map(t => ({ id: t.id, title: t.title, position: t.globalPosition })));

      // Insert at target position
      targetDateTasks.splice(targetIndex, 0, task);

      console.log('Target date tasks after insert:', targetDateTasks.map(t => ({ id: t.id, title: t.title })));

      // Update all positions with consistent base time
      const baseTime = Date.now();
      targetDateTasks.forEach((t, index) => {
        t.globalPosition = baseTime + index;
        t.updatedAt = new Date();
        console.log(`Updated task ${t.id} position to ${t.globalPosition}`);
      });

      await this.saveTasks();
      console.log('Tasks saved successfully');
      return true;
    } catch (error) {
      console.error('Error in reorderTasksAcrossDates:', error);
      return false;
    }
  }

  private async saveTasks(): Promise<void> {
    if (typeof window !== 'undefined') {
      const taskData = {
        tasks: this.tasks,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      
      console.log('TaskService.saveTasks - saving tasks:', this.tasks.length, 'tasks');
      console.log('TaskService.saveTasks - first few tasks:', this.tasks.slice(0, 3).map(t => ({ id: t.id, title: t.title, position: t.globalPosition })));
      
      localStorage.setItem(this.storageKey, JSON.stringify(taskData));
      
      // Verify the save
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('TaskService.saveTasks - verification: saved', parsed.tasks.length, 'tasks');
        console.log('TaskService.saveTasks - verification: first few tasks:', parsed.tasks.slice(0, 3).map(t => ({ id: t.id, title: t.title, position: t.globalPosition })));
      } else {
        console.log('TaskService.saveTasks - ERROR: Failed to save to localStorage');
      }
    }
  }

  private parseTasks(rawTasks: unknown[]): Task[] {
    return rawTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      completed: task.completed,
      priority: task.priority || false,
      dueDate: this.parseDate(task.dueDate),
      category: task.category || undefined,
      tags: task.tags || [],
      subtasks: (task.subtasks || []).map((subtask: unknown) => ({
        id: subtask.id,
        title: subtask.title,
        completed: subtask.completed || false
      })),
      createdAt: this.parseDate(task.createdAt) || new Date(),
      updatedAt: this.parseDate(task.updatedAt) || new Date(),
      globalPosition: task.globalPosition || Date.now()
    }));
  }

  private parseDate(dateString: string | undefined): Date | undefined {
    if (!dateString) return undefined;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return undefined;
      }
      return date;
    } catch {
      return undefined;
    }
  }

  private mergeTasks(freshTasks: Task[], localTasks: Task[]): Task[] {
    // Create a map of local tasks by ID for quick lookup
    const localTaskMap = new Map(localTasks.map(task => [task.id, task]));
    
    // Merge: use local version if exists, otherwise use fresh version
    const mergedTasks = freshTasks.map(freshTask => {
      const localTask = localTaskMap.get(freshTask.id);
      if (localTask) {
        // Use local version (has user changes)
        return localTask;
      }
      return freshTask;
    });
    
    // Add any new tasks from local storage that don't exist in fresh data
    const freshTaskIds = new Set(freshTasks.map(task => task.id));
    const newLocalTasks = localTasks.filter(task => !freshTaskIds.has(task.id));
    
    return [...mergedTasks, ...newLocalTasks];
  }
}
