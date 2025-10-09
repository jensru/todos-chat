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
  // Drag & Drop methods
  handleReorderWithinDate: (dateKey: string, taskIds: string[]) => Promise<void>;
  handleMoveTaskToDate: (taskId: string, newDate: Date | null) => Promise<void>;
  handleReorderAcrossDates: (taskId: string, targetDate: Date | null, targetIndex: number) => Promise<void>;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskService] = useState(() => new TaskService());

  const loadData = useCallback(async (): Promise<void> => {
    try {
      console.log('loadData called - loading tasks from service...');
      const loadedTasks = await taskService.loadTasks();
      console.log('loadData - loaded tasks:', loadedTasks.length, 'tasks');
      console.log('loadData - first few tasks:', loadedTasks.slice(0, 3).map(t => ({ id: t.id, title: t.title, position: t.globalPosition })));
      setTasks(loadedTasks);
      console.log('loadData - tasks state updated');
    } catch {
      console.log('loadData - error loading tasks, setting empty array');
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
    console.log('groupedTasks memoization - tasks changed, recalculating...');
    const grouped = tasks
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

    // Sort each group by globalPosition
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => a.globalPosition - b.globalPosition);
      console.log(`groupedTasks - ${dateKey}:`, grouped[dateKey].map(t => ({ id: t.id, title: t.title, position: t.globalPosition })));
    });

    console.log('groupedTasks memoization - completed, keys:', Object.keys(grouped));
    return grouped;
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

  // Drag & Drop methods
  const handleReorderWithinDate = useCallback(async (dateKey: string, taskIds: string[]): Promise<void> => {
    console.log('handleReorderWithinDate called:', { dateKey, taskIds });
    
    // Don't update state immediately - let the service call handle it
    console.log('Calling taskService.reorderTasksWithinDate...');
    const success = await taskService.reorderTasksWithinDate(dateKey, taskIds);
    console.log('reorderTasksWithinDate success:', success);
    
    if (success) {
      // Service call succeeded, reload data to get updated state
      console.log('Service call succeeded, reloading data...');
      await loadData();
    } else {
      console.log('Service call failed');
    }
  }, [taskService, loadData]);

  const handleMoveTaskToDate = useCallback(async (taskId: string, newDate: Date | null): Promise<void> => {
    const success = await taskService.moveTaskToDate(taskId, newDate);
    if (success) {
      await loadData(); // Reload to get updated data
    }
  }, [taskService, loadData]);

  const handleReorderAcrossDates = useCallback(async (taskId: string, targetDate: Date | null, targetIndex: number): Promise<void> => {
    console.log('handleReorderAcrossDates called:', { taskId, targetDate, targetIndex });
    
    // Don't update state immediately - let the service call handle it
    const success = await taskService.reorderTasksAcrossDates(taskId, targetDate, targetIndex);
    console.log('reorderTasksAcrossDates success:', success);
    
    if (success) {
      // Service call succeeded, reload data to get updated state
      console.log('Service call succeeded, reloading data...');
      await loadData();
    } else {
      console.log('Service call failed');
    }
  }, [taskService, loadData]);

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
    loadData,
    // Drag & Drop methods
    handleReorderWithinDate,
    handleMoveTaskToDate,
    handleReorderAcrossDates
  };
}