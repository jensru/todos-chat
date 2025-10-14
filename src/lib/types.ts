// src/lib/types.ts - TypeScript Types
export interface ITask {
  id: string;
  userId: string; // Neue Spalte für Multi-User
  title: string;
  description?: string;
  notes?: string; // Notizen für das Todo
  completed: boolean;
  priority: boolean; // true = High Priority, false = Normal
  dueDate?: Date;
  category?: string;
  tags: string[];
  subtasks: ISubtask[];
  createdAt: Date;
  updatedAt: Date;
  globalPosition: number;
}

// Erweiterte Task-Interface für überfällige Tasks
export interface ITaskWithOverdue extends ITask {
  isOverdue: boolean;           // Wird dynamisch berechnet
  originalDueDate: string | undefined;    // YYYY-MM-DD für überfällige Tasks
  displayDate: string;         // "heute" für überfällige Tasks
  overdueSince: Date | undefined;         // Wann wurde der Task überfällig
}

export interface ISubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface IGoal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// Type aliases for easier usage
export type Task = ITask;
export type TaskWithOverdue = ITaskWithOverdue;
export type Subtask = ISubtask;
export type Goal = IGoal;
export type Message = IMessage;

