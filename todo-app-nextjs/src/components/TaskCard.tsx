// src/components/TaskCard.tsx - Professional Task Card Component
'use client';

import { Star, Calendar, Folder, Edit, Save, X, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Task, Subtask } from '@/lib/types';

interface ITaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete }: ITaskCardProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editCategory, setEditCategory] = useState(task.category || '');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleToggleComplete = (): void => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handlePriorityToggle = (): void => {
    onUpdate(task.id, { priority: !task.priority });
  };

  const handleSaveEdit = (): void => {
    onUpdate(task.id, {
      title: editTitle,
      description: editDescription,
      category: editCategory.trim() || undefined
    });
    setIsEditing(false);
  };

  const handleCancelEdit = (): void => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditCategory(task.category || '');
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    setIsEditing(false);
  };

  const handleAddSubtask = (): void => {
    const subtaskTitle = prompt('Unteraufgabe hinzufügen:');
    if (subtaskTitle) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        title: subtaskTitle,
        completed: false
      };
      
      const updatedSubtasks = [...task.subtasks, newSubtask];
      onUpdate(task.id, { subtasks: updatedSubtasks });
    }
  };

  const handleToggleSubtask = (subtaskId: string): void => {
    const updatedSubtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId 
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );
    
    onUpdate(task.id, { subtasks: updatedSubtasks });
  };

  const handleCategoryChange = (value: string): void => {
    if (value === 'new') {
      setShowNewCategoryInput(true);
    } else if (value === 'none') {
      setEditCategory('');
    } else {
      setEditCategory(value);
    }
  };

  const handleAddNewCategory = (): void => {
    if (newCategoryName.trim()) {
      setEditCategory(newCategoryName.trim());
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  };

  return (
    <Card className={`${task.completed ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
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
            
            {/* Task Title */}
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1"
                placeholder="Aufgabentitel"
              />
            ) : (
              <h3 className={`text-lg font-normal ${task.completed ? 'line-through' : ''}`}>
                {task.title}
              </h3>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
            />
            {isEditing ? (
              <Button onClick={handleSaveEdit} size="sm">
                <Save className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={() => onDelete(task.id)} variant="ghost" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Description */}
        {isEditing ? (
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="mb-3"
            placeholder="Beschreibung (optional)"
            rows={2}
          />
        ) : (
          task.description && (
            <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
          )
        )}
        
        {/* Category */}
        {isEditing ? (
          <div className="mb-3">
            <Select value={editCategory || 'none'} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Kategorie</SelectItem>
                <SelectItem value="new">+ Neue Kategorie hinzufügen</SelectItem>
              </SelectContent>
            </Select>
            
            {showNewCategoryInput && (
              <div className="mt-2 flex space-x-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Neue Kategorie eingeben"
                />
                <Button onClick={handleAddNewCategory} size="sm">Hinzufügen</Button>
                <Button onClick={() => setShowNewCategoryInput(false)} variant="outline" size="sm">Abbrechen</Button>
              </div>
            )}
          </div>
        ) : (
          task.category && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Folder className="h-3 w-3 mr-1" />
              {task.category}
            </div>
          )
        )}
        
        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3 mr-1" />
            {task.dueDate.toLocaleDateString('de-DE')}
          </div>
        )}
        
        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Unteraufgaben ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
            </div>
            <div className="space-y-1">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => handleToggleSubtask(subtask.id)}
                  />
                  <span className={`${subtask.completed ? 'line-through opacity-60' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-between items-center mt-4">
          <Button onClick={handleAddSubtask} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Unteraufgabe
          </Button>
          
          {isEditing && (
            <div className="flex space-x-2">
              <Button onClick={handleSaveEdit} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Speichern
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Abbrechen
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
