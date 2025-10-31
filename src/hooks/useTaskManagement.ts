// src/hooks/useTaskManagement.ts - Custom Hook for Task Management
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ApiTaskService } from '@/lib/services/ApiTaskService';
import { ITask as Task, TaskWithOverdue } from '@/lib/types';
import { formatDateForDisplay, formatDateToYYYYMMDD, getTodayAsYYYYMMDD } from '@/lib/utils/dateUtils';

export function useTaskManagement(): {
  tasks: Task[];
  tasksWithOverdue: TaskWithOverdue[];
  loading: boolean;
  handleTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  handleTaskDelete: (taskId: string) => Promise<void>;
  handleAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getTaskStats: () => { total: number; completed: number; active: number; highPriority: number; completionRate: number };
  groupedTasks: Record<string, TaskWithOverdue[]>;
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

  // Ref hält den aktuellen Tasks-Zustand, um Abhängigkeiten von `tasks` in Callbacks zu vermeiden
  const tasksRef = useRef<Task[]>(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      // Don't set loading to true for refresh operations to avoid white flash
      const loadedTasks = await taskService.loadTasks();
      
      // Debug log removed to prevent console spam
      
      // Diff-based sync: Find new tasks
      if (tasksRef.current.length > 0) {
        const currentTaskIds = new Set(tasksRef.current.map(t => t.id));
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
  }, [taskService]);

  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
    // Store original task for potential revert
    const originalTask = tasksRef.current.find(t => t.id === taskId);
    if (!originalTask) return;

    // Check if this is a date change (moving task)
    if (originalTask.dueDate && updates.dueDate && originalTask.dueDate !== updates.dueDate) {
      const currentDate = new Date(originalTask.dueDate);
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
    
    // Optimistic update: Update local state immediately for better UX
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
    ));
    
    // Then try to update in the service
    const success = await taskService.updateTask(taskId, updates);
    if (!success) {
      // Revert optimistic update if service call failed
      setTasks(prev => prev.map(task =>
        task.id === taskId ? originalTask : task
      ));
    }
    // Note: No reload on success - optimistic update is sufficient
    // Only reload if date changed significantly to sync grouping
    if (updates.dueDate && originalTask.dueDate && updates.dueDate !== originalTask.dueDate) {
      // Small delay to allow animation, then sync data
      setTimeout(async () => {
        await loadData();
      }, 500);
    }
  }, [taskService, loadData]);

  const handleTaskDelete = useCallback(async (taskId: string): Promise<void> => {
    // Store original task for potential revert
    const originalTask = tasksRef.current.find(t => t.id === taskId);
    if (!originalTask) return;

    // Optimistic update: Remove from UI immediately
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    // Then delete on server
    const success = await taskService.deleteTask(taskId);
    if (!success) {
      // Revert optimistic update if deletion failed
      setTasks(prev => {
        const taskExists = prev.some(t => t.id === taskId);
        if (!taskExists) {
          return [...prev, originalTask];
        }
        return prev;
      });
    }
  }, [taskService]);

  const handleAddTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    // Create optimistic task
    const optimisticTask: Task = {
      ...taskData,
      id: tempId,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      globalPosition: Date.now()
    };

    // Optimistic update: Add to UI immediately
    setTasks(prev => [...prev, optimisticTask]);
    setNewTaskIds(prev => new Set([...prev, tempId]));
    
    // Then save to server
    const success = await taskService.addTask(taskData);
    if (success) {
      // Reload to get the real task with correct ID from server
      // This is necessary because we need the real ID
      await loadData();
    } else {
      // Revert optimistic update if save failed
      setTasks(prev => prev.filter(task => task.id !== tempId));
      setNewTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    }
  }, [taskService, loadData]);

  const getTaskStats = useCallback(() => {
    return taskService.getTaskStats(tasks);
  }, [taskService, tasks]);

  // Neue groupedTasks-Logik mit Overdue-Support
  const groupedTasks = useMemo(() => {
    const today = getTodayAsYYYYMMDD();
    
    const grouped = tasks
      .filter(task => !task.completed)
      .reduce((acc, task) => {
        let dateKey = 'ohne-datum';
        let isOverdue = false;

        if (task.dueDate) {
          try {
            if (!isNaN(task.dueDate.getTime())) {
              const taskDate = formatDateToYYYYMMDD(task.dueDate);
              
              // Prüfe ob Task überfällig ist
              if (taskDate < today) {
                isOverdue = true;
                dateKey = today; // Überfällige Tasks in "Heute"-Gruppe
              } else {
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
        
        // Erstelle TaskWithOverdue
        const taskWithOverdue: TaskWithOverdue = {
          ...task,
          isOverdue,
          originalDueDate: task.dueDate ? formatDateToYYYYMMDD(task.dueDate) : undefined,
          displayDate: isOverdue ? today : (task.dueDate ? formatDateToYYYYMMDD(task.dueDate) : 'ohne-datum'),
          overdueSince: isOverdue ? task.dueDate : undefined
        };
        
        acc[dateKey].push(taskWithOverdue);
        return acc;
      }, {} as Record<string, TaskWithOverdue[]>);

    // Sortiere: Heute (mit überfälligen) immer oben
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
      if (a === today) return -1; // Heute immer oben
      if (b === today) return 1;
      return a.localeCompare(b);
    });

    // Sortiere Tasks innerhalb jeder Gruppe nach globalPosition
    sortedEntries.forEach(([, tasks]) => {
      tasks.sort((a, b) => a.globalPosition - b.globalPosition);
    });

    return Object.fromEntries(sortedEntries);
  }, [tasks]);

  // Tasks mit Overdue-Status für Kompatibilität
  const tasksWithOverdue = useMemo(() => {
    return tasks.map(task => {
      const today = getTodayAsYYYYMMDD();
      const taskDate = task.dueDate ? formatDateToYYYYMMDD(task.dueDate) : 'ohne-datum';
      const isOverdue = taskDate !== 'ohne-datum' && taskDate < today;
      
      return {
        ...task,
        isOverdue,
        originalDueDate: taskDate !== 'ohne-datum' ? taskDate : undefined,
        displayDate: isOverdue ? today : taskDate,
        overdueSince: isOverdue ? task.dueDate : undefined
      };
    });
  }, [tasks]);

  const formatDate = useCallback((dateString: string): string => {
    return formatDateForDisplay(dateString);
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
    // Store original task for potential revert
    const originalTask = tasksRef.current.find(t => t.id === taskId);
    if (!originalTask) return;

    // Optimistic update: Update date immediately
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, updatedAt: new Date() };
        if (newDate) {
          updatedTask.dueDate = newDate;
        } else {
          delete updatedTask.dueDate;
        }
        return updatedTask;
      }
      return task;
    }));

    // Determine animation direction if date changed
    if (originalTask.dueDate && newDate) {
      const currentDate = new Date(originalTask.dueDate);
      const targetDate = new Date(newDate);
      
      if (targetDate < currentDate) {
        setMovingUpTaskIds(prev => new Set([...prev, taskId]));
        setTimeout(() => setMovingUpTaskIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        }), 400);
      } else if (targetDate > currentDate) {
        setMovingDownTaskIds(prev => new Set([...prev, taskId]));
        setTimeout(() => setMovingDownTaskIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        }), 400);
      }
    }
    
    // Then save to server
    const success = await taskService.moveTaskToDate(taskId, newDate);
    if (!success) {
      // Revert optimistic update if save failed
      setTasks(prev => prev.map(task =>
        task.id === taskId ? originalTask : task
      ));
    } else {
      // Reload to sync positions and ensure consistency
      await loadData();
    }
  }, [taskService, loadData]);

  const handleReorderAcrossDates = useCallback(async (taskId: string, targetDate: Date | null, targetIndex: number): Promise<void> => {
    // Update state immediately for smooth animation
    setTasks(prevTasks => {
      const task = prevTasks.find(t => t.id === taskId);
      if (!task) return prevTasks;

      // Use local date formatting instead of UTC
      const targetDateKey = targetDate ? formatDateToYYYYMMDD(targetDate) : 'ohne-datum';

      // Get all tasks for the target date (excluding the moving task)
      const targetDateTasks = prevTasks.filter(t => {
        if (t.completed || t.id === taskId) return false;
        const taskDateKey = t.dueDate ? formatDateToYYYYMMDD(t.dueDate) : 'ohne-datum';
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
            ...(targetDate && { dueDate: targetDate }),
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
    const originalTask = tasksRef.current.find(t => t.id === taskId);
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
  }, [taskService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    tasks,
    tasksWithOverdue,
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