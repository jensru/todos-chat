// src/components/TaskActions.tsx - Task Actions Component
'use client';

import { Plus, Save, X, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ITaskActionsProps {
  isEditing: boolean;
  onAddSubtask: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

export function TaskActions({
  isEditing,
  onAddSubtask,
  onSaveEdit,
  onCancelEdit,
  onDelete
}: ITaskActionsProps): JSX.Element {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="flex space-x-2">
        <Button onClick={onAddSubtask} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Unteraufgabe
        </Button>
      </div>

      <div className="flex space-x-2">
        {isEditing ? (
          <>
            <Button onClick={onSaveEdit} size="sm">
              <Save className="h-4 w-4 mr-1" />
              Speichern
            </Button>
            <Button onClick={onCancelEdit} variant="outline" size="sm">
              <X className="h-4 w-4 mr-1" />
              Abbrechen
            </Button>
          </>
        ) : null}

        <Button onClick={onDelete} variant="ghost" size="sm" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}