// src/hooks/useMistralChat.ts - Custom Hook for Mistral AI Chat
'use client';

import { useState, useEffect, useCallback } from 'react';

import { MistralService } from '@/lib/services/MistralService';
import { Message } from '@/lib/types';

export function useMistralChat(): {
  messages: Message[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: (taskContext?: { tasks: number; goals: number }) => Promise<void>;
  isServiceReady: boolean;
} {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'bot', text: 'Hey, woran willst du heute arbeiten?', timestamp: new Date() }
  ]);
  const [mistralService, setMistralService] = useState<MistralService | null>(null);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = useCallback(async (taskContext?: { tasks: number; goals: number }): Promise<void> => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    if (mistralService) {
      try {
        const aiResponse = await mistralService.generateSmartResponse(userMessage, taskContext || {
          tasks: 0,
          goals: 0
        });

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: 'Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es später erneut.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'KI-Service wird noch initialisiert... Bitte warte einen Moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }
  }, [mistralService, chatInput]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setMistralService(new MistralService());
      } catch {
        setMistralService(null);
      }
    }
  }, []);

  return {
    messages,
    chatInput,
    setChatInput,
    handleSendMessage,
    isServiceReady: mistralService !== null
  };
}