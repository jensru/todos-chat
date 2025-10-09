// src/components/TaskHeader.tsx - Task Header Component
'use client';

import { Star, Edit, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface ITaskHeaderProps {
  title: string;
  completed: boolean;
  priority: boolean;
  isEditing: boolean;
  editTitle: string;
  onToggleComplete: () => void;
  onPriorityToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onTitleChange: (value: string) => void;
}

export function TaskHeader({
  title,
  completed,
  priority,
  isEditing,
  editTitle,
  onToggleComplete,
  onPriorityToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTitleChange
}: ITaskHeaderProps): JSX.Element {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPriorityToggle}
          className={`p-1 h-auto ${
            priority
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Star className={`h-4 w-4 ${priority ? 'fill-current' : ''}`} />
        </Button>

        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="flex-1"
            placeholder="Aufgabentitel"
          />
        ) : (
          <h3 className={`text-lg font-normal ${completed ? 'line-through' : ''}`}>
            {title}
          </h3>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          checked={completed}
          onCheckedChange={onToggleComplete}
        />
        {isEditing ? (
          <>
            <Button onClick={onSaveEdit} size="sm">
              <Save className="h-4 w-4" />
            </Button>
            <Button onClick={onCancelEdit} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button onClick={onStartEdit} variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}