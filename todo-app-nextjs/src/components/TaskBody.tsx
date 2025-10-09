// src/components/TaskBody.tsx - Task Body Component
'use client';

import { Calendar, Folder } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ITaskBodyProps {
  description?: string;
  category?: string;
  dueDate?: Date;
  isEditing: boolean;
  editDescription: string;
  editCategory: string;
  showNewCategoryInput: boolean;
  newCategoryName: string;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onNewCategoryNameChange: (value: string) => void;
  onAddNewCategory: () => void;
  onCancelNewCategory: () => void;
}

export function TaskBody({
  description,
  category,
  dueDate,
  isEditing,
  editDescription,
  editCategory,
  showNewCategoryInput,
  newCategoryName,
  onDescriptionChange,
  onCategoryChange,
  onNewCategoryNameChange,
  onAddNewCategory,
  onCancelNewCategory
}: ITaskBodyProps): JSX.Element {
  return (
    <>
      {/* Description */}
      {isEditing ? (
        <Textarea
          value={editDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="mb-3"
          placeholder="Beschreibung (optional)"
          rows={2}
        />
      ) : (
        description && (
          <p className="text-muted-foreground text-sm mb-3">{description}</p>
        )
      )}

      {/* Category */}
      {isEditing ? (
        <div className="mb-3">
          <Select value={editCategory || 'none'} onValueChange={onCategoryChange}>
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
                onChange={(e) => onNewCategoryNameChange(e.target.value)}
                placeholder="Neue Kategorie eingeben"
              />
              <Button onClick={onAddNewCategory} size="sm">Hinzufügen</Button>
              <Button onClick={onCancelNewCategory} variant="outline" size="sm">Abbrechen</Button>
            </div>
          )}
        </div>
      ) : (
        category && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Folder className="h-3 w-3 mr-1" />
            {category}
          </div>
        )
      )}

      {/* Due Date */}
      {dueDate && (
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Calendar className="h-3 w-3 mr-1" />
          {dueDate.toLocaleDateString('de-DE')}
        </div>
      )}
    </>
  );
}