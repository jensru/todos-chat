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
    });

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
    // Update state immediately for smooth animation
    setTasks(prevTasks => {
      const baseTime = Date.now();
      return prevTasks.map(task => {
        const index = taskIds.indexOf(task.id);
        if (index !== -1) {
          return {
            ...task,
            globalPosition: baseTime + index,
            updatedAt: new Date()
          };
        }
        return task;
      });
    });
    
    // Then save to service
    const success = await taskService.reorderTasksWithinDate(dateKey, taskIds);
    
    if (!success) {
      // If service call failed, reload data to revert changes
      await loadData();
    }
  }, [taskService, loadData]);

  const handleMoveTaskToDate = useCallback(async (taskId: string, newDate: Date | null): Promise<void> => {
    const success = await taskService.moveTaskToDate(taskId, newDate);
    if (success) {
      await loadData(); // Reload to get updated data
    }
  }, [taskService, loadData]);

  const handleReorderAcrossDates = useCallback(async (taskId: string, targetDate: Date | null, targetIndex: number): Promise<void> => {
    // Update state immediately for smooth animation
    setTasks(prevTasks => {
      const task = prevTasks.find(t => t.id === taskId);
      if (!task) return prevTasks;
      
      const targetDateKey = targetDate ? targetDate.toISOString().split('T')[0] : 'ohne-datum';
      
      // Get all tasks for the target date (excluding the moving task)
      const targetDateTasks = prevTasks.filter(t => {
        if (t.completed || t.id === taskId) return false;
        const taskDateKey = t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'ohne-datum';
        return taskDateKey === targetDateKey;
      });
      
      // Sort by current global position
      targetDateTasks.sort((a, b) => a.globalPosition - b.globalPosition);
      
      // Insert at target position
      targetDateTasks.splice(targetIndex, 0, task);
      
      // Calculate new positions
      const baseTime = Date.now();
      const updatedTasks = prevTasks.map(t => {
        const index = targetDateTasks.findIndex(tt => tt.id === t.id);
        if (index !== -1) {
          return {
            ...t,
            dueDate: targetDate,
            globalPosition: baseTime + index,
            updatedAt: new Date()
          };
        }
        return t;
      });
      
      return updatedTasks;
    });
    
    // Then save to service
    const success = await taskService.reorderTasksAcrossDates(taskId, targetDate, targetIndex);
    
    if (!success) {
      // If service call failed, reload data to revert changes
      await loadData();
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