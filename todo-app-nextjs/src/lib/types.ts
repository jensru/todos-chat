// src/lib/types.ts - TypeScript Types
export interface ITask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: boolean; // true = High Priority, false = Normal
  dueDate?: Date;
  category?: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  globalPosition: number;
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

export interface IWorkingStyleDNA {
  preferredTaskBreakdown: number;
  quickWinsFirst: boolean;
  typicalDueDateRange: number;
  [key: string]: unknown;
}
