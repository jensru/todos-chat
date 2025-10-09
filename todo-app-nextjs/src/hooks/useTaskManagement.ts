// src/hooks/useTaskManagement.ts - Custom Hook for Task Management
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { TaskService } from '@/lib/services/TaskService';
import { Task } from '@/lib/types';

export function useTaskManagement(): {
  tasks: Task[];
  loading: boolean;
  handleTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  handleTaskDelete: (taskId: string) => Promise<void>;
  handleAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getTaskStats: () => { total: number; completed: number; active: number; highPriority: number; completionRate: number };
  groupedTasks: Record<string, Task[]>;
  formatDate: (dateString: string) => string;
  loadData: () => Promise<void>;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskService] = useState(() => new TaskService());

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const loadedTasks = await taskService.loadTasks();
      setTasks(loadedTasks);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [taskService]);

  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
    const success = await taskService.updateTask(taskId, updates);
    if (success) {
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      ));
    }
  }, [taskService]);

  const handleTaskDelete = useCallback(async (taskId: string): Promise<void> => {
    const success = await taskService.deleteTask(taskId);
    if (success) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  }, [taskService]);

  const handleAddTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    const success = await taskService.addTask(taskData);
    if (success) {
      await loadData();
    }
  }, [taskService, loadData]);

  const getTaskStats = useCallback(() => {
    return taskService.getTaskStats();
  }, [taskService]);

  const groupedTasks = useMemo(() => {
    return tasks
      .filter(task => !task.completed)
      .reduce((acc, task) => {
        let dateKey = 'ohne-datum';

        if (task.dueDate) {
          try {
            if (!isNaN(task.dueDate.getTime())) {
              const taskDate = task.dueDate.toISOString().split('T')[0];
              const today = new Date().toISOString().split('T')[0];

              if (taskDate >= today) {
                dateKey = taskDate;
              } else {
                return acc;
              }
            }
          } catch {
            dateKey = 'ohne-datum';
          }
        }

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(task);
        return acc;
      }, {} as Record<string, Task[]>);
  }, [tasks]);

  const formatDate = useCallback((dateString: string): string => {
    if (dateString === 'ohne-datum') return 'Ohne Datum';

    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      if (dateString === today.toISOString().split('T')[0]) {
        return 'Heute';
      } else if (dateString === tomorrow.toISOString().split('T')[0]) {
        return 'Morgen';
      } else {
        return date.toLocaleDateString('de-DE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
      }
    } catch {
      return 'Ungültiges Datum';
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    tasks,
    loading,
    handleTaskUpdate,
    handleTaskDelete,
    handleAddTask,
    getTaskStats,
    groupedTasks,
    formatDate,
    loadData
  };
}