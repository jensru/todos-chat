// src/hooks/useGoals.ts - Custom Hook for Goals Management
'use client';

import { useState, useEffect } from 'react';

import { Goal } from '@/lib/types';

export function useGoals(): {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  loadGoals: () => void;
} {
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadGoals = (): void => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('todo-app-data');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setGoals(data.goals || []);
        } catch {
          setGoals([]);
        }
      }
    }
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);

    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('todo-app-data');
      const data = savedData ? JSON.parse(savedData) : {};
      localStorage.setItem('todo-app-data', JSON.stringify({
        ...data,
        goals: updatedGoals
      }));
    }
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>): void => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId
        ? { ...goal, ...updates, updatedAt: new Date() }
        : goal
    );

    setGoals(updatedGoals);

    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('todo-app-data');
      const data = savedData ? JSON.parse(savedData) : {};
      localStorage.setItem('todo-app-data', JSON.stringify({
        ...data,
        goals: updatedGoals
      }));
    }
  };

  const deleteGoal = (goalId: string): void => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);

    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('todo-app-data');
      const data = savedData ? JSON.parse(savedData) : {};
      localStorage.setItem('todo-app-data', JSON.stringify({
        ...data,
        goals: updatedGoals
      }));
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    loadGoals
  };
}