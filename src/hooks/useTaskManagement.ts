// src/hooks/useTaskManagement.ts - Custom Hook for Task Management
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiTaskService } from '@/lib/services/ApiTaskService';
import { ITask as Task } from '@/lib/types';

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
  // Optimistic updates
  handleTaskUpdateOptimistic: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  // Animation
  newTaskIds: Set<string>;
  movingUpTaskIds: Set<string>;
  movingDownTaskIds: Set<string>;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading = true
  const [taskService] = useState(() => new ApiTaskService());
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set());
  const [movingUpTaskIds, setMovingUpTaskIds] = useState<Set<string>>(new Set());
  const [movingDownTaskIds, setMovingDownTaskIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async (): Promise<void> => {
    try {
      // Don't set loading to true for refresh operations to avoid white flash
      const loadedTasks = await taskService.loadTasks();
      
      // Diff-based sync: Find new tasks
      if (tasks.length > 0) {
        const currentTaskIds = new Set(tasks.map(t => t.id));
        const newTasks = loadedTasks.filter(task => !currentTaskIds.has(task.id));
        const newTaskIdsSet = new Set(newTasks.map(t => t.id));
        
        console.log('🔄 Sync - New tasks found:', newTaskIdsSet.size);
        
        setTasks(loadedTasks);
        setNewTaskIds(newTaskIdsSet);
        
        // Clear animation flags after animation
        setTimeout(() => {
          setNewTaskIds(new Set());
        }, 1000);
      } else {
        // Initial load - no animation
        setTasks(loadedTasks);
      }
      
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [taskService, tasks]);

  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
    // Check if this is a date change (moving task)
    const currentTask = tasks.find(t => t.id === taskId);
    if (currentTask && updates.dueDate && currentTask.dueDate !== updates.dueDate) {
      const currentDate = new Date(currentTask.dueDate);
      const newDate = new Date(updates.dueDate);
      
      // Determine animation direction
      if (newDate < currentDate) {
        // Moving to earlier date = moving up
        setMovingUpTaskIds(prev => new Set([...prev, taskId]));
        setTimeout(() => setMovingUpTaskIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        }), 400);
      } else if (newDate > currentDate) {
        // Moving to later date = moving down
        setMovingDownTaskIds(prev => new Set([...prev, taskId]));
        setTimeout(() => setMovingDownTaskIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        }), 400);
      }
    }
    
    const success = await taskService.updateTask(taskId, updates);
    if (success) {
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      ));
    }
  }, [taskService, tasks]);

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
    return taskService.getTaskStats(tasks);
  }, [taskService, tasks]);

  const groupedTasks = useMemo(() => {
    const grouped = tasks
      .filter(task => !task.completed)
      .reduce((acc, task) => {
        let dateKey = 'ohne-datum';

        if (task.dueDate) {
          try {
            if (!isNaN(task.dueDate.getTime())) {
              // Use local date instead of UTC to avoid timezone offset issues
              const taskDate = `${task.dueDate.getFullYear()}-${String(task.dueDate.getMonth() + 1).padStart(2, '0')}-${String(task.dueDate.getDate()).padStart(2, '0')}`;
              const todayObj = new Date();
              const today = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

              // Always include tasks with dates (even past dates)
              // This fixes the issue where tasks moved to "today" disappear
              if (taskDate >= today) {
                dateKey = taskDate;
              } else {
                // For past dates, still include them but mark as "overdue"
                dateKey = taskDate;
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

      // Use local date formatting instead of UTC
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      if (dateString === todayStr) {
        return `Heute (${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })})`;
      } else if (dateString === tomorrowStr) {
        return `Morgen (${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })})`;
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

      // Use local date formatting instead of UTC
      const targetDateKey = targetDate ? `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}` : 'ohne-datum';

      // Get all tasks for the target date (excluding the moving task)
      const targetDateTasks = prevTasks.filter(t => {
        if (t.completed || t.id === taskId) return false;
        const taskDateKey = t.dueDate ? `${t.dueDate.getFullYear()}-${String(t.dueDate.getMonth() + 1).padStart(2, '0')}-${String(t.dueDate.getDate()).padStart(2, '0')}` : 'ohne-datum';
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
            dueDate: targetDate || undefined,
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


  // Optimistic update for smooth drag & drop animation
  const handleTaskUpdateOptimistic = useCallback(async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    // Store original task for potential revert
    const originalTask = tasks.find(t => t.id === taskId);
    if (!originalTask) return false;

    // Update state immediately for smooth animation
    setTasks(prevTasks => 
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    
    // Try to update in the service
    try {
      const success = await taskService.updateTask(taskId, updates);
      if (!success) {
        // Revert optimistic update if service call failed
        setTasks(prevTasks => 
          prevTasks.map(task =>
            task.id === taskId ? originalTask : task
          )
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Task update failed:', error);
      // Revert optimistic update
      setTasks(prevTasks => 
        prevTasks.map(task =>
          task.id === taskId ? originalTask : task
        )
      );
      return false;
    }
  }, [taskService, tasks]);

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
    handleReorderAcrossDates,
    // Optimistic updates
    handleTaskUpdateOptimistic,
    // Animation
    newTaskIds,
    movingUpTaskIds,
    movingDownTaskIds
  };
}