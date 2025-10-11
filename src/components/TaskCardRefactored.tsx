"use client";

import React, { useState, useEffect } from 'react';
import { Star, Calendar, Edit, Save, X, Trash2, GripVertical, StickyNote } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/lib/types';

// Helper function to safely convert date to ISO string
const safeDateToISO = (date: any): string => {
  if (!date) return '';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  } catch {
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
}

export function TaskCardRefactored({ task, onUpdate, onDelete, isDragging = false, dragHandleProps, dragRef }: ITaskCardProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDueDate, setEditDueDate] = useState(safeDateToISO(task.dueDate));
  const [editNotes, setEditNotes] = useState(task.notes || '');

  // Sync edit state when task changes (e.g., after drag & drop)
  useEffect(() => {
    setEditTitle(task.title);
    setEditDueDate(safeDateToISO(task.dueDate));
    setEditNotes(task.notes || '');
  }, [task.title, task.dueDate, task.notes]);

  const handleToggleComplete = (): void => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handlePriorityToggle = (): void => {
    onUpdate(task.id, { priority: !task.priority });
  };

  const handleSaveEdit = (): void => {
    const updates: Partial<Task> = { title: editTitle, notes: editNotes };
    if (editDueDate) {
      updates.dueDate = new Date(editDueDate);
    } else {
      updates.dueDate = undefined;
    }
    onUpdate(task.id, updates);
    setIsEditing(false);
  };

  const handleCancelEdit = (): void => {
    setEditTitle(task.title);
    setEditDueDate(safeDateToISO(task.dueDate));
    setEditNotes(task.notes || '');
    setIsEditing(false);
  };

  return (
    <Card 
      ref={dragRef}
      className={`transition-all duration-200 hover:shadow-sm ${task.completed ? 'opacity-60' : ''} py-2 gap-0 rounded-md ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <CardContent className="px-3 py-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Drag Handle */}
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
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
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Aufgabentitel"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  autoFocus
                />
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <Input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="text-xs"
                    placeholder="Fälligkeitsdatum"
                  />
                </div>
                <div className="flex items-start space-x-2">
                  <StickyNote className="h-3 w-3 text-muted-foreground mt-1" />
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
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
                <Button onClick={handleSaveEdit} variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Save className="h-3 w-3" />
                </Button>
                <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="h-8 w-8 p-0">
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