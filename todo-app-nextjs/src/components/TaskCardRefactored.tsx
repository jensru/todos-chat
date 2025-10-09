// src/components/TaskCardRefactored.tsx - Refactored Task Card Component
'use client';

import { useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Task, Subtask } from '@/lib/types';

import { SubtaskList } from './SubtaskList';
import { TaskActions } from './TaskActions';
import { TaskBody } from './TaskBody';
import { TaskHeader } from './TaskHeader';

interface ITaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCardRefactored({ task, onUpdate, onDelete }: ITaskCardProps): JSX.Element {
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

  const handleCancelNewCategory = (): void => {
    setShowNewCategoryInput(false);
    setNewCategoryName('');
  };

  return (
    <Card className={`${task.completed ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <TaskHeader
          title={task.title}
          completed={task.completed}
          priority={task.priority}
          isEditing={isEditing}
          editTitle={editTitle}
          onToggleComplete={handleToggleComplete}
          onPriorityToggle={handlePriorityToggle}
          onStartEdit={() => setIsEditing(true)}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onTitleChange={setEditTitle}
        />
      </CardHeader>

      <CardContent className="pt-0">
        <TaskBody
          description={task.description}
          category={task.category}
          dueDate={task.dueDate}
          isEditing={isEditing}
          editDescription={editDescription}
          editCategory={editCategory}
          showNewCategoryInput={showNewCategoryInput}
          newCategoryName={newCategoryName}
          onDescriptionChange={setEditDescription}
          onCategoryChange={handleCategoryChange}
          onNewCategoryNameChange={setNewCategoryName}
          onAddNewCategory={handleAddNewCategory}
          onCancelNewCategory={handleCancelNewCategory}
        />

        <SubtaskList
          subtasks={task.subtasks}
          onToggleSubtask={handleToggleSubtask}
        />

        <TaskActions
          isEditing={isEditing}
          onAddSubtask={handleAddSubtask}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDelete={() => onDelete(task.id)}
        />
      </CardContent>
    </Card>
  );
}