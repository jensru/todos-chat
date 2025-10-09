// src/components/TaskCardRefactored.tsx - Einzeilige Task Card Component
'use client';

import { Star, Calendar, Folder, Edit, Save, X, Trash2, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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

export function TaskCardRefactored({ task, onUpdate, onDelete, isDragging = false, dragHandleProps, dragRef }: ITaskCardProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDueDate, setEditDueDate] = useState(safeDateToISO(task.dueDate));

  // Sync edit state when task changes (e.g., after drag & drop)
  useEffect(() => {
    setEditTitle(task.title);
    setEditDueDate(safeDateToISO(task.dueDate));
  }, [task.title, task.dueDate]);

  const handleToggleComplete = (): void => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handlePriorityToggle = (): void => {
    onUpdate(task.id, { priority: !task.priority });
  };

  const handleSaveEdit = (): void => {
    const updates: Partial<Task> = { title: editTitle };
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
              </div>
            ) : (
              <h3 className={`text-base font-normal flex-1 truncate ${task.completed ? 'line-through opacity-60' : ''}`} style={{ fontSize: '16px', lineHeight: '1.5' }}>
                {task.title}
              </h3>
            )}
            
            {/* Category Badge */}
            {task.category && !isEditing && (
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                <Folder className="h-3 w-3 inline mr-1" />
                {task.category}
              </span>
            )}
          </div>
          
          {/* Priority Star and Actions */}
          <div className="flex items-center space-x-1 ml-3 flex-shrink-0">
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
      </CardContent>
    </Card>
  );
}