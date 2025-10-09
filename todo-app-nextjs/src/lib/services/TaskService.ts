// src/lib/services/TaskService.ts - Professional Task Service
import { Task } from '@/lib/types';

export class TaskService {
  private tasks: Task[] = [];
  private storageKey = 'todo-app-tasks';

  async loadTasks(): Promise<Task[]> {
    try {
      console.log('TaskService: Starting to load tasks...');
      
      // Load from standardized JSON files first (always fresh data)
      const response = await fetch('/data/smart-tasks-standardized.json');
      console.log('TaskService: Fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('TaskService: Raw data received, tasks count:', data.tasks?.length || 0);
        this.tasks = this.parseTasks(data.tasks || []);
        console.log('TaskService: Parsed tasks:', this.tasks.length);
        
        // Apply LocalStorage changes on top of fresh data
        if (typeof window !== 'undefined') {
          const localData = localStorage.getItem(this.storageKey);
          if (localData) {
            const parsedData = JSON.parse(localData);
            if (parsedData.tasks && parsedData.tasks.length > 0) {
              // Merge LocalStorage changes with fresh data
              const localTasks = this.parseTasks(parsedData.tasks);
              this.tasks = this.mergeTasks(this.tasks, localTasks);
              console.log('TaskService: Merged with localStorage:', this.tasks.length);
            }
          }
        }
      } else {
        console.error('TaskService: Failed to fetch data, status:', response.status);
        this.tasks = [];
      }

      console.log('TaskService: Returning tasks:', this.tasks.length);
      return this.tasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
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
    } catch (error) {
      console.error('Error updating task:', error);
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
    } catch (error) {
      console.error('Error adding task:', error);
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
    } catch (error) {
      console.error('Error deleting task:', error);
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
        
        // 2. Sort by priority (true = High Priority first)
        if (a.priority !== b.priority) {
          return b.priority ? 1 : -1;
        }
        
        // 3. Sort by global position
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

  private async saveTasks(): Promise<void> {
    if (typeof window !== 'undefined') {
      const taskData = {
        tasks: this.tasks,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(taskData));
    }
  }

  private parseTasks(rawTasks: any[]): Task[] {
    return rawTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      completed: task.completed,
      priority: task.priority || false,
      dueDate: this.parseDate(task.dueDate),
      category: task.category || undefined,
      tags: task.tags || [],
      subtasks: (task.subtasks || []).map((subtask: any) => ({
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
        console.warn('Invalid date:', dateString);
        return undefined;
      }
      return date;
    } catch (error) {
      console.warn('Error parsing date:', dateString, error);
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
