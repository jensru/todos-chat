"use client";

import { Calendar, Check, Edit, GripVertical, Star, StickyNote, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/lib/types';
import { formatDateToYYYYMMDD } from '@/lib/utils/dateUtils';

// Helper function to safely convert date to ISO string (local timezone)
const safeDateToISO = (date: any): string => {
  if (!date) return '';
  try {
    // If it's already a string in YYYY-MM-DD format, return as is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return formatDateToYYYYMMDD(dateObj);
  } catch (error) {
    console.warn('safeDateToISO error:', error, 'date:', date);
    return '';
  }
};

interface ITaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  // Drag & Drop props
  isDragging?: boolean;
  dragHandleProps?: any;
  dragRef?: (element: HTMLElement | null) => void;
  // Animation props
  isNewTask?: boolean;
  isMovingUp?: boolean;
  isMovingDown?: boolean;
}

export function TaskCardRefactored({ task, onUpdate, onDelete, isDragging = false, dragHandleProps, dragRef, isNewTask = false, isMovingUp = false, isMovingDown = false }: ITaskCardProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDueDate, setEditDueDate] = useState(safeDateToISO(task.dueDate));
  const [editNotes, setEditNotes] = useState(task.notes || '');
  const [isNew, setIsNew] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);



  // Auto-save function with debouncing
  const autoSave = useCallback(async () => {
    if (!isEditing) return;
    
    // Check if task was recently updated (e.g., by Mistral)
    const taskLastUpdated = new Date(task.updatedAt || task.createdAt);
    const now = new Date();
    const timeSinceUpdate = now.getTime() - taskLastUpdated.getTime();
    
    // If task was updated in the last 3 seconds, skip auto-save to avoid conflicts
    if (timeSinceUpdate < 3000) {
      console.log('Skipping auto-save - task recently updated by external source');
      return;
    }
    
    setIsSaving(true);
    try {
      const updates: Partial<Task> = {};
      
      if (editTitle !== task.title) updates.title = editTitle;
      if (editDueDate !== safeDateToISO(task.dueDate)) {
        if (editDueDate) {
          updates.dueDate = new Date(editDueDate);
        }
        // Don't set dueDate if empty - let it remain as is
      }
      if (editNotes !== (task.notes || '')) updates.notes = editNotes;
      
      if (Object.keys(updates).length > 0) {
        await onUpdate(task.id, updates);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000); // Show saved indicator for 2s
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isEditing, editTitle, editDueDate, editNotes, task, onUpdate]);

  // Debounced auto-save
  const scheduleAutoSave = useCallback((delay: number = 1500) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      autoSave();
    }, delay);
    
    setAutoSaveTimeout(timeout);
  }, [autoSave, autoSaveTimeout]);

  // Sync edit state when task changes (only if not currently editing)
  useEffect(() => {
    if (!isEditing) {
      setEditTitle(task.title);
      setEditDueDate(safeDateToISO(task.dueDate));
      setEditNotes(task.notes || '');
    }
  }, [task.title, task.dueDate, task.notes, isEditing]);

  // Prevent date picker from closing by stabilizing the input
  const handleDateInputFocus = useCallback((_e: React.FocusEvent<HTMLInputElement>) => {
    // Prevent any state updates that might interfere with date picker
    console.log('Date input focused');
  }, []);

  const handleDateInputClick = useCallback((_e: React.MouseEvent<HTMLInputElement>) => {
    // Prevent any state updates that might interfere with date picker
    console.log('Date input clicked');
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Slide-in animation for new tasks
  useEffect(() => {
    if (isNewTask) {
      console.log('🎨 Starting slide-in animation for:', task.title);
      setIsNew(true);
      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        console.log('🎨 Animation finished for:', task.title);
        setIsNew(false);
      }, 600);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isNewTask, task.title]);

  // Slide animation for task reordering
  useEffect(() => {
    if (isMovingUp || isMovingDown) {
      console.log('🎨 Starting slide animation for:', task.title, isMovingUp ? 'UP' : 'DOWN');
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        console.log('🎨 Slide animation finished for:', task.title);
        setIsAnimating(false);
      }, 400); // Match CSS animation duration
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isMovingUp, isMovingDown, task.title]);

  const handleToggleComplete = (): void => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handlePriorityToggle = (): void => {
    onUpdate(task.id, { priority: !task.priority });
  };

  const handleCancelEdit = (): void => {
    // Cancel auto-save timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
    
    // Reset to original values
    setEditTitle(task.title);
    setEditDueDate(safeDateToISO(task.dueDate));
    setEditNotes(task.notes || '');
    setIsEditing(false);
    setIsSaving(false);
    setIsSaved(false);
  };

  const handleExitEdit = (): void => {
    // Just exit edit mode without canceling changes
    // Auto-save will handle any pending changes
    setIsEditing(false);
    setIsSaving(false);
    setIsSaved(false);
  };

  return (
    <Card 
      ref={dragRef}
      className={`transition-all duration-200 hover:shadow-sm ${task.completed ? 'opacity-60' : ''} py-2 gap-0 rounded-md ${isDragging ? 'opacity-50 shadow-lg' : ''} ${isNew ? 'animate-slide-in' : ''} ${isAnimating ? (isMovingUp ? 'animate-slide-up' : 'animate-slide-down') : ''}`}
    >
      <CardContent className="px-3 py-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Drag Handle - Kompakter aber trotzdem touch-freundlich */}
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-0.5 -m-0.5 rounded-sm hover:bg-muted/30 touch-manipulation"
              style={{ minWidth: '24px', minHeight: '24px' }}
            >
              <GripVertical className="h-4 w-4" />
            </div>
            {/* Checkbox */}
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
            />
            
            {/* Task Title */}
            {isEditing ? (
              <div className="flex-1 flex flex-col space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    scheduleAutoSave();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleExitEdit();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelEdit();
                    }
                  }}
                  placeholder="Aufgabentitel"
                  autoFocus
                />
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => {
                      console.log('Date input changed:', e.target.value);
                      setEditDueDate(e.target.value);
                      // Don't trigger auto-save immediately for date changes
                      // Let user finish selecting the date first
                    }}
                    onInput={(e) => {
                      // Handle direct input changes (keyboard typing)
                      const target = e.target as HTMLInputElement;
                      console.log('Date input direct:', target.value);
                      setEditDueDate(target.value);
                    }}
                    onFocus={handleDateInputFocus}
                    onClick={handleDateInputClick}
                    onBlur={() => {
                      // Trigger auto-save when user finishes with date input (longer delay)
                      scheduleAutoSave(3000); // 3 second delay for date inputs
                    }}
                    className="text-xs flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Fälligkeitsdatum"
                  />
                </div>
                <div className="flex items-start space-x-2">
                  <StickyNote className="h-3 w-3 text-muted-foreground mt-1" />
                  <Textarea
                    value={editNotes}
                    onChange={(e) => {
                      setEditNotes(e.target.value);
                      scheduleAutoSave();
                    }}
                    placeholder="Notizen hinzufügen..."
                    className="text-xs min-h-[60px] resize-none"
                  />
                </div>
              </div>
            ) : (
              <h3 className={`text-base font-normal flex-1 truncate ${task.completed ? 'line-through opacity-60' : ''}`} style={{ fontSize: '16px', lineHeight: '1.5' }}>
                {task.title}
              </h3>
            )}
            
            {/* Category Badge */}
            {task.category && !isEditing && (
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                {task.category}
              </span>
            )}
          </div>
          
          {/* Priority Star and Actions */}
          <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
            {/* Notes Icon */}
            {task.notes && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="p-1 h-auto text-blue-500 hover:text-blue-600"
              >
                <StickyNote className="h-4 w-4" />
              </Button>
            )}
            {/* Priority Star */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePriorityToggle}
              className={`p-1 h-auto ${
                task.priority 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star className={`h-4 w-4 ${task.priority ? 'fill-current' : ''}`} />
            </Button>
            {isEditing ? (
              <>
                {/* Auto-save status indicator */}
                {isSaving && (
                  <div className="text-xs text-muted-foreground animate-pulse">
                    Speichere...
                  </div>
                )}
                {isSaved && (
                  <div className="text-xs text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Gespeichert
                  </div>
                )}
                <Button onClick={handleExitEdit} variant="ghost" size="sm" className="h-8 w-8 p-0" title="Fertig">
                  <Check className="h-3 w-3" />
                </Button>
                <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" title="Verwerfen">
                  <X className="h-3 w-3" />
                </Button>
                <Button onClick={() => onDelete(task.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Notes Section */}
        {showNotes && task.notes && !isEditing && (
          <div className="mt-3 pt-3 border-t border-muted">
            <div className="flex items-start space-x-2">
              <StickyNote className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.notes}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}