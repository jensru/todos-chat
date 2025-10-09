// src/components/SubtaskList.tsx - Subtask List Component
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Subtask } from '@/lib/types';

interface ISubtaskListProps {
  subtasks: Subtask[];
  onToggleSubtask: (subtaskId: string) => void;
}

export function SubtaskList({ subtasks, onToggleSubtask }: ISubtaskListProps): JSX.Element | null {
  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="text-sm font-medium text-muted-foreground mb-2">
        Unteraufgaben ({subtasks.filter(s => s.completed).length}/{subtasks.length})
      </div>
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center space-x-2 text-sm">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => onToggleSubtask(subtask.id)}
            />
            <span className={`${subtask.completed ? 'line-through opacity-60' : ''}`}>
              {subtask.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}