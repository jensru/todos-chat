// src/components/TaskCardRefactored.tsx - Einzeilige Task Card Component
'use client';

import { Star, Calendar, Folder, Edit, Save, X, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Task } from '@/lib/types';

interface ITaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCardRefactored({ task, onUpdate, onDelete }: ITaskCardProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDueDate, setEditDueDate] = useState(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');

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
    setEditDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
    setIsEditing(false);
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-sm ${task.completed ? 'opacity-60' : ''}`} style={{ height: 'calc(2 * 1.5em)' }}>
      <CardContent className="py-1 px-3">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
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
              <h3 className={`text-base font-normal flex-1 truncate ${task.completed ? 'line-through opacity-60' : ''}`} style={{ fontSize: '16px' }}>
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