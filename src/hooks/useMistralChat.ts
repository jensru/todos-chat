// src/hooks/useMistralChat.ts - Custom Hook for Mistral AI Chat
'use client';

import { useState, useEffect, useCallback } from 'react';

import { MistralToolsService } from '@/lib/services/MistralToolsService';
import { Message } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import { useLocale } from './useLocale';

export function useMistralChat(): {
  messages: Message[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: (taskContext?: { tasks: number; goals: number; taskService?: any }) => Promise<void>;
  isServiceReady: boolean;
  clearChat: () => void;
} {
  const { language, isReady } = useLocale();
  const { t } = useTranslation(language as any);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [mistralToolsService, setMistralToolsService] = useState<MistralToolsService | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Initialize welcome message when locale is ready
  useEffect(() => {
    if (isReady && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        text: t('chat.welcomeMessage'),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isReady, t]);

  // Load messages from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && isReady) {
      const savedMessages = localStorage.getItem('mistral-chat-messages');
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          // Convert timestamp strings back to Date objects
          const loadedMessages = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(loadedMessages);
        } catch (error) {
          console.error('Error parsing saved messages:', error);
        }
      }
    }
  }, [isReady]); // Run when locale is ready

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mistral-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Function to clear chat
  const clearChat = useCallback(() => {
    const defaultMessage: Message = {
      id: '1',
      type: 'bot',
      text: t('chat.welcomeMessage'),
      timestamp: new Date()
    };
    setMessages([defaultMessage]);
  }, [t]);

  const handleSendMessage = useCallback(async (taskContext?: { tasks: number; goals: number; taskService?: any }): Promise<void> => {
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

    if (mistralToolsService) {
      try {
        // Use tools service for enhanced functionality
        const result = await mistralToolsService.callMistralWithTools(userMessage, taskContext || {
          tasks: 0,
          goals: 0
        });

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: result.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);

        // Auto-refresh tasks if needed (server-side tools were executed)
        if (result.needsRefresh && taskContext?.taskService?.loadData) {
          console.log('useMistralChat - refreshing tasks after tool execution');
          await taskContext.taskService.loadData();
        }
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
  }, [mistralToolsService, chatInput]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const toolsService = new MistralToolsService();
        console.log('MistralToolsService initialized successfully');
        setMistralToolsService(toolsService);
      } catch (error) {
        console.error('useMistralChat initialization error:', error);
        setMistralToolsService(null);
      }
    }
  }, []);

  return {
    messages,
    chatInput,
    setChatInput,
    handleSendMessage,
    isServiceReady: mistralToolsService !== null,
    clearChat
  };
}