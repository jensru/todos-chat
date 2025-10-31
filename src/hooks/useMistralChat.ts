// src/hooks/useMistralChat.ts - Custom Hook for Mistral AI Chat
'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '@/lib/i18n';
import { MistralToolsService } from '@/lib/services/MistralToolsService';
import { Message } from '@/lib/types';
import { useLocale } from './useLocale';

export function useMistralChat(): {
  messages: Message[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: (taskContext?: { tasks: number; goals: number; taskService?: any }) => Promise<void>;
  isServiceReady: boolean;
  isSending: boolean;
  clearChat: () => void;
} {
  const { language, isReady } = useLocale();
  const { t } = useTranslation(language as any);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [mistralToolsService, setMistralToolsService] = useState<MistralToolsService | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);

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
    if (!chatInput.trim() || isSending) return;

    // Throttle requests - minimum 2 seconds between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minDelay = 2000; // 2 seconds minimum between requests
    
    if (timeSinceLastRequest < minDelay && lastRequestTime > 0) {
      const waitTime = Math.ceil((minDelay - timeSinceLastRequest) / 1000);
      const throttledMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        text: `Bitte warte ${waitTime} Sekunde${waitTime > 1 ? 'n' : ''}, bevor du eine weitere Anfrage stellst.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, throttledMessage]);
      return;
    }

    setIsSending(true);
    setLastRequestTime(now);

    const userMessage = chatInput.trim();
    setChatInput('');

    // Prepare message history BEFORE adding the new message
    // This ensures we only send previous messages, not the current one
    const historyForApi = messages
      .filter(msg => msg.type === 'user' || msg.type === 'bot')
      .filter(msg => !msg.text.includes('⏳')) // Exclude loading messages
      .filter(msg => msg.id !== '1') // Exclude initial welcome message
      .map(msg => ({
        type: msg.type,
        text: msg.text,
        timestamp: msg.timestamp
      }));

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Add loading message
    const loadingMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: loadingMessageId,
      type: 'bot',
      text: '⏳ Verarbeite deine Anfrage...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, loadingMessage]);

    if (mistralToolsService) {
      try {

        // Use tools service for enhanced functionality with message history
        const result = await mistralToolsService.callMistralWithTools(
          userMessage, 
          taskContext || {
            tasks: 0,
            goals: 0
          },
          historyForApi
        );

        // Remove loading message and add response
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingMessageId);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: result.response,
            timestamp: new Date()
          };
          return [...filtered, botMessage];
        });

        // Auto-refresh tasks if needed (server-side tools were executed)
        if (result.needsRefresh && taskContext?.taskService?.loadData) {
          console.log('useMistralChat - refreshing tasks after tool execution');
          // Use smooth refresh without loading state to avoid white flash
          setTimeout(async () => {
            await taskContext.taskService.loadData();
          }, 100); // Shorter delay for smoother experience
        }
      } catch (error) {
        // Remove loading message
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingMessageId);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: 'Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es später erneut.',
            timestamp: new Date()
          };
          return [...filtered, errorMessage];
        });
      } finally {
        setIsSending(false);
      }
    } else {
      // Remove loading message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: 'KI-Service wird noch initialisiert... Bitte warte einen Moment.',
          timestamp: new Date()
        };
        return [...filtered, fallbackMessage];
      });
      setIsSending(false);
    }
  }, [mistralToolsService, chatInput, isSending, lastRequestTime]);

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
    isSending,
    clearChat
  };
}