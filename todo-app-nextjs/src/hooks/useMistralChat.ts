// src/hooks/useMistralChat.ts - Custom Hook for Mistral AI Chat
'use client';

import { useState, useEffect, useCallback } from 'react';

import { MistralService } from '@/lib/services/MistralService';
import { MistralToolsService } from '@/lib/services/MistralToolsService';
import { Message } from '@/lib/types';

export function useMistralChat(): {
  messages: Message[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: (taskContext?: { tasks: number; goals: number; taskService?: any }) => Promise<void>;
  isServiceReady: boolean;
  clearChat: () => void;
} {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'bot', text: 'Hey, woran willst du heute arbeiten? Ich kann dir helfen, Aufgaben zu erstellen, zu filtern und zu verwalten!', timestamp: new Date() }
  ]);
  const [mistralService, setMistralService] = useState<MistralService | null>(null);
  const [mistralToolsService, setMistralToolsService] = useState<MistralToolsService | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Load messages from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, []); // Only run on mount

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
      text: 'Hey, woran willst du heute arbeiten? Ich kann dir helfen, Aufgaben zu erstellen, zu filtern und zu verwalten!',
      timestamp: new Date()
    };
    setMessages([defaultMessage]);
  }, []);

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

        // Handle tool calls if present
        if (result.toolCalls && result.toolCalls.length > 0) {
          for (const toolCall of result.toolCalls) {
            try {
              // Use the task service from context
              const toolResult = await mistralToolsService.executeToolCall(toolCall, taskContext?.taskService || null);
              
              const toolMessage: Message = {
                id: (Date.now() + 2).toString(),
                type: 'bot',
                text: `🔧 ${toolResult}`,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, toolMessage]);
            } catch (error) {
              const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                type: 'bot',
                text: `❌ Fehler beim Ausführen des Tools: ${error}`,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, errorMessage]);
            }
          }
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
        setMistralService(new MistralService());
        console.log('MistralService initialized successfully');
        
        // Test MistralToolsService initialization
        try {
          const toolsService = new MistralToolsService();
          console.log('MistralToolsService initialized successfully');
          setMistralToolsService(toolsService);
        } catch (toolsError) {
          console.error('MistralToolsService initialization error:', toolsError);
          setMistralToolsService(null);
        }
      } catch (error) {
        console.error('useMistralChat initialization error:', error);
        setMistralService(null);
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