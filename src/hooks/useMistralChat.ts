// src/hooks/useMistralChat.ts - Custom Hook for Mistral AI Chat
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/lib/i18n';
import { MistralToolsService } from '@/lib/services/MistralToolsService';
import { Message } from '@/lib/types';
import { useLocale } from './useLocale';
import { getTodayAsYYYYMMDD } from '@/lib/utils/dateUtils';

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
  const isSendingRef = useRef<boolean>(false);
  const cooldownUntilRef = useRef<number>(0);

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

  // Load messages for TODAY from server once locale is ready
  useEffect(() => {
    const loadFromServer = async (): Promise<void> => {
      if (!isReady) return;
      try {
        const dateISO = getTodayAsYYYYMMDD();
        const res = await fetch(`/api/chat-messages?date=${dateISO}`);
        if (!res.ok) throw new Error(`Failed to load chat: ${res.status}`);
        const data = await res.json();
        const serverMessages = (data.messages || []).map((m: any) => ({
          id: m.id,
          type: m.role === 'user' ? 'user' : 'bot',
          text: m.content,
          timestamp: new Date(m.createdAt)
        })) as Message[];
        if (serverMessages.length > 0) {
          setMessages(serverMessages);
        }
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      }
    };
    void loadFromServer();
  }, [isReady]);

  // Persist a single message to server (fire and forget)
  const persistMessage = useCallback(async (role: 'user' | 'bot', content: string): Promise<void> => {
    try {
      const dateISO = getTodayAsYYYYMMDD();
      await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateISO, role, content })
      });
    } catch (error) {
      console.error('Failed to persist chat message:', error);
    }
  }, []);

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
    // Single-flight Guard (block Doppel-Trigger durch KeyDown/Click im selben Tick)
    if (isSendingRef.current) return;

    // Aktiven Cooldown respektieren (Retry-After vom Server)
    const nowPre = Date.now();
    if (nowPre < cooldownUntilRef.current) {
      const waitMs = cooldownUntilRef.current - nowPre;
      const waitSec = Math.ceil(waitMs / 1000);
      const cooldownMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        text: `Bitte warte ${waitSec} Sekunde${waitSec > 1 ? 'n' : ''}, bevor du eine weitere Anfrage stellst.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, cooldownMessage]);
      return;
    }

    // Throttle requests - minimum delay between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minDelay = 5000; // 5 seconds minimum between requests
    
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

    isSendingRef.current = true;
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
    void persistMessage('user', userMessage);

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

        // Falls der Server ein Retry-After kommuniziert hat, Cooldown setzen
        if (typeof result.cooldownMs === 'number' && result.cooldownMs > 0) {
          cooldownUntilRef.current = Date.now() + result.cooldownMs;
        }

        // Remove loading message and add response
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingMessageId);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: result.response,
            timestamp: new Date()
          };
          // Persist bot message
          void persistMessage('bot', botMessage.text);
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
        isSendingRef.current = false;
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
      isSendingRef.current = false;
    }
  }, [mistralToolsService, chatInput, lastRequestTime]);

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