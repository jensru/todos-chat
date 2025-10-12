// src/app/page.tsx - Main App with Professional Architecture
'use client';

import React from "react";

import { closestCenter, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, MeasuringStrategy, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle2, ChevronUp, LogOut, Mic, MicOff, Plus, Target, Trash2, X } from 'lucide-react';

import { TaskCardRefactored as TaskCard } from '@/components/TaskCardRefactored';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGoals } from '@/hooks/useGoals';
import { useLocale } from '@/hooks/useLocale';
import { useMistralChat } from '@/hooks/useMistralChat';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTranslation } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import { parseAndSanitizeMarkdown } from '@/lib/utils/markdownParser';
import { useEffect, useRef, useState } from 'react';

// Speech Recognition types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

// Sortable Task Card Component
function SortableTaskCard({ task, onUpdate, onDelete, activeTask: _activeTask, isNewTask, isMovingUp, isMovingDown }: {
  task: any;
  onUpdate: (taskId: string, updates: Partial<any>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  activeTask?: any;
  isNewTask?: boolean;
  isMovingUp?: boolean;
  isMovingDown?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition || 'transform 200ms ease'),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    pointerEvents: isDragging ? 'none' as const : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isNewTask={isNewTask}
        isMovingUp={isMovingUp}
        isMovingDown={isMovingDown}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        dragRef={setNodeRef}
      />
    </div>
  );
}

// Sortable Date Header Component
function SortableDateHeader({ dateKey, formatDate, taskCount }: {
  dateKey: string;
  formatDate: (dateString: string) => string;
  taskCount: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `header-${dateKey}`,
    data: {
      type: 'date-header',
      dateKey,
      date: dateKey === 'ohne-datum' ? null : new Date(dateKey)
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition || 'transform 200ms ease'),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    pointerEvents: isDragging ? 'none' as const : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="my-2">
      <h3 className="text-lg font-semibold px-3 py-2 bg-muted/20 rounded-md flex items-center">
        <span className="flex-1"></span>
        <span className="text-center">{formatDate(dateKey)}</span>
        <span className="flex-1 text-right text-sm text-muted-foreground font-normal">
          {taskCount} Tasks
        </span>
      </h3>
    </div>
  );
}

export default function HomePage(): React.JSX.Element {
  const { language, isReady } = useLocale();
  const { t } = useTranslation(language as any);
  const { settings, updateSettings } = useUserSettings();
  
  const taskManagement = useTaskManagement();
  const {
    tasks,
    loading,
    handleTaskUpdate,
    handleTaskDelete,
    handleAddTask,
    getTaskStats,
    groupedTasks,
    formatDate,
    handleTaskUpdateOptimistic,
    newTaskIds,
    movingUpTaskIds,
    movingDownTaskIds
  } = taskManagement;

  // Supabase client for logout
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  

  const {
    messages,
    chatInput,
    setChatInput,
    handleSendMessage,
    clearChat
  } = useMistralChat();

  // Create task service object for Mistral tools
  const taskService = {
    handleAddTask,
    handleTaskUpdate,
    handleTaskDelete,
    tasks,
    getTaskStats,
    loadData: taskManagement.loadData
  };

  const { goals } = useGoals();

  // Audio input state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Mobile chat state - Hydration-safe
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Chat scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  const stats = getTaskStats();

  // Set client-side flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize speech recognition with dynamic language
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && isReady) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = settings.speechLanguage;
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
      console.log('Speech recognition initialized with language:', recognitionInstance.lang);
    }
  }, [settings.speechLanguage, isReady]);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Keyboard Shortcuts für Chat
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC-Taste zum Schließen des Chats
      if (event.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
        return;
      }
      
      // Nur wenn kein Input-Feld fokussiert ist
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).contentEditable === 'true'
      );
      
      if (!isInputFocused) {
        // C-Taste zum Öffnen/Schließen des Chats
        if (event.key === 'c' || event.key === 'C') {
          setIsChatOpen(!isChatOpen);
          event.preventDefault();
          return;
        }
        
        // Leertaste zum Öffnen/Schließen des Chats
        if (event.key === ' ') {
          setIsChatOpen(!isChatOpen);
          event.preventDefault();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatOpen]);

  // Drag & Drop state
  const [activeTask, setActiveTask] = useState<any>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Drag & Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveTask(active.data.current?.task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Simple drag over - no complex live feedback for now
  };


  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !active.data.current) {
      return;
    }

    const activeTask = active.data.current.task;
    const overElement = over.data.current;

    if (!overElement) {
      console.log('🎯 Drag end: No over element');
      return;
    }

    console.log('🎯 Drag end:', {
      task: activeTask.title,
      overType: overElement.type
    });

    // Get the current flat list order (only tasks, not headers)
    const currentFlatList = getFlatList().filter(item => item.type === 'task');
    const overIndex = currentFlatList.findIndex(item => item.id === over.id);

    // Handle date header drops
    if (overElement.type === 'date-header') {
      const newDate = overElement.date;
      const targetDateKey = overElement.dateKey;
      const targetDateTasks = groupedTasks[targetDateKey] || [];

      // Calculate position at end of date group
      const maxPosition = targetDateTasks.length > 0
        ? Math.max(...targetDateTasks.map(t => t.globalPosition))
        : 0;
      const newPosition = maxPosition + 100; // Add 100 for spacing

      console.log('📅 Date header drop:', {
        newDate,
        newPosition
      });

      await handleTaskUpdateOptimistic(activeTask.id, {
        dueDate: newDate,
        globalPosition: newPosition,
        updatedAt: new Date()
      });
      return;
    }

    // Handle task-to-task drops: Calculate position BETWEEN neighbors
    const overTask = overElement.task;
    const overTaskDate = overTask.dueDate;

    // Find the index of the active (dragged) task
    const activeIndex = currentFlatList.findIndex(item => item.id === active.id);

    // Determine if we're moving down or up
    const movingDown = activeIndex < overIndex;

    let newPosition: number;

    if (overIndex === 0) {
      // Dropped at the beginning
      const nextTask = currentFlatList[0].task;
      newPosition = nextTask.globalPosition - 100;
    } else if (overIndex >= currentFlatList.length - 1) {
      // Dropped at the end
      const prevTask = currentFlatList[currentFlatList.length - 1].task;
      newPosition = prevTask.globalPosition + 100;
    } else {
      // Dropped between two tasks - calculate midpoint
      // When moving down, we want to be AFTER the target
      // When moving up, we want to be BEFORE the target
      if (movingDown) {
        // Moving down: position between overTask and next task
        const nextTask = currentFlatList[overIndex + 1]?.task;
        if (nextTask) {
          newPosition = (overTask.globalPosition + nextTask.globalPosition) / 2;
        } else {
          // No next task, place after overTask
          newPosition = overTask.globalPosition + 100;
        }
      } else {
        // Moving up: position between previous task and overTask
        const prevTask = currentFlatList[overIndex - 1]?.task;
        if (prevTask) {
          newPosition = (prevTask.globalPosition + overTask.globalPosition) / 2;
        } else {
          // No previous task, place before overTask
          newPosition = overTask.globalPosition - 100;
        }
      }
    }

    console.log('🔄 Task-to-task drop:', {
      newPosition,
      newDate: overTaskDate,
      overTask: overTask.title
    });

    // Update ONLY the moved task - O(1) operation!
    // Also update the date to match the target task's date
    await handleTaskUpdateOptimistic(activeTask.id, {
      globalPosition: newPosition,
      dueDate: overTaskDate, // ← FIX: Übernehme das Datum des Ziel-Tasks!
      updatedAt: new Date()
    });
  };

  // Rebalance positions if they get too close together
  const rebalancePositions = async () => {
    console.log('🔧 Rebalancing all task positions...');

    const flatList = getFlatList().filter(item => item.type === 'task');

    // Update each task with evenly spaced positions (100, 200, 300...)
    for (let i = 0; i < flatList.length; i++) {
      const newPosition = (i + 1) * 100;
      await handleTaskUpdateOptimistic(flatList[i].task.id, {
        globalPosition: newPosition
      });
    }

    console.log('✅ Rebalancing complete');
  };

  // Helper function to create flat list of all items
  const getFlatList = () => {
    const flatList: Array<{id: string, type: string, task?: any, dateKey?: string, date?: Date | null}> = [];
    
    // Sort date keys chronologically
    const sortedDateKeys = Object.keys(groupedTasks).sort((a, b) => {
      if (a === 'ohne-datum') return 1; // Put "ohne-datum" at the end
      if (b === 'ohne-datum') return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    sortedDateKeys.forEach(dateKey => {
      const dateTasks = groupedTasks[dateKey];
      
      // Add date header
      flatList.push({
        id: `header-${dateKey}`,
        type: 'date-header',
        dateKey,
        date: dateKey === 'ohne-datum' ? null : new Date(dateKey)
      });
      
      // Add tasks for this date (sorted by globalPosition to maintain DB order)
      const sortedTasks = [...dateTasks].sort((a, b) => a.globalPosition - b.globalPosition);
      sortedTasks.forEach(task => {
        flatList.push({
          id: task.id,
          type: 'task',
          task
        });
      });
    });
    
    return flatList;
  };


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Aufgaben...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-background lg:flex">
      {/* Chat Panel */}
      <div className={`
        fixed bottom-[88px] left-0 right-0 z-50
        bg-white flex flex-col
        transition-transform duration-300 ease-in-out
        ${isClient && isChatOpen ? 'translate-y-0' : 'translate-y-full'}
        h-[calc(100vh-88px)] rounded-t-2xl
        border-t-0
        lg:relative lg:translate-y-0 lg:w-1/3 lg:max-w-[500px] 
        lg:border-r lg:h-screen lg:rounded-none lg:bg-muted/30 lg:bottom-0
      `}>
        <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold">KI-Assistent</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              title="Abmelden"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              title="Chat-Verlauf löschen"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(false)}
              className="lg:hidden"
              title="Chat schließen"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg text-sm ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-8'
                  : 'bg-muted mr-8'
              }`}
              style={{ 
                fontSize: '14px',
                fontWeight: 'normal'
              }}
              dangerouslySetInnerHTML={{ 
                __html: parseAndSanitizeMarkdown(message.text) 
              }}
            />
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-border flex-shrink-0 hidden lg:block">
          <div className="flex space-x-2">
            <Input
              placeholder={t('chat.placeholder')}
              className="flex-1"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage({ tasks: tasks.length, goals: goals.length, taskService });
                }
              }}
            />
            <Button 
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={isListening ? stopListening : startListening}
              disabled={!recognition}
              title={isListening ? "Aufnahme stoppen" : "Spracheingabe starten"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={() => handleSendMessage({ tasks: tasks.length, goals: goals.length, taskService })}>Send</Button>
          </div>
        </div>
      </div>

      {/* Mobile Chat Input Bar - Immer sichtbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex-shrink-0 lg:hidden shadow-lg">
        {/* Pfeil-Button oben */}
        <div className="flex justify-center py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="h-6 w-6 p-0 hover:bg-gray-100"
            title={isChatOpen ? "Chat schließen" : "Chat öffnen"}
          >
            <ChevronUp 
              className={`h-4 w-4 transition-transform duration-200 ${
                isChatOpen ? 'rotate-180' : ''
              }`} 
            />
          </Button>
        </div>
        
        {/* Input Bar */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <Input
            placeholder={t('chat.placeholder')}
            className="flex-1"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage({ tasks: tasks.length, goals: goals.length, taskService });
                // Chat auf Mobile öffnen nach dem Senden
                if (window.innerWidth < 1024) {
                  setIsChatOpen(true);
                }
              }
            }}
          />
          <Button 
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            disabled={!recognition}
            title={isListening ? "Aufnahme stoppen" : "Spracheingabe starten"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={() => {
            handleSendMessage({ tasks: tasks.length, goals: goals.length, taskService });
            // Chat auf Mobile öffnen nach dem Senden
            if (window.innerWidth < 1024) {
              setIsChatOpen(true);
            }
          }}>Send</Button>
          </div>
        </div>
      </div>

      {/* Backdrop für Mobile */}
      {isChatOpen && (
        <div
          onClick={() => setIsChatOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Speech Language Selector - Fixed ganz rechts oben */}
      <div className="fixed top-4 right-4 z-50">
        <select
          value={settings.speechLanguage}
          onChange={(e) => updateSettings({ speechLanguage: e.target.value })}
          className="px-2 py-1 text-xs text-muted-foreground border-0 bg-white/80 backdrop-blur-sm hover:bg-white rounded shadow-sm cursor-pointer"
          title="Speech Recognition Language"
        >
          <option value="en-US">EN</option>
          <option value="de-DE">DE</option>
          <option value="fr-FR">FR</option>
          <option value="es-ES">ES</option>
          <option value="it-IT">IT</option>
          <option value="pt-BR">PT</option>
          <option value="ru-RU">RU</option>
          <option value="ja-JP">JA</option>
          <option value="ko-KR">KO</option>
          <option value="zh-CN">ZH</option>
          <option value="ar-SA">AR</option>
          <option value="hi-IN">HI</option>
        </select>
      </div>

      {/* Canvas Panel */}
      <div className="w-full h-screen p-6 pb-20 overflow-y-auto lg:flex-1 lg:pb-6">
        <div className="max-w-4xl mx-auto">

          {/* Goals Section */}
          {goals.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Ziele
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-3 border border-border rounded-lg">
                      <h3 className="font-medium">{goal.title}</h3>
                      <div className="mt-2 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{goal.progress}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks Section */}
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.WhileDragging,
              },
            }}
          >
            <SortableContext 
              items={getFlatList().map(item => item.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {getFlatList().map((item) => (
                  <div key={item.id}>
                    {item.type === 'date-header' ? (
                      <SortableDateHeader
                        dateKey={item.dateKey!}
                        formatDate={formatDate}
                        taskCount={groupedTasks[item.dateKey!]?.length || 0}
                      />
                    ) : (
                      <SortableTaskCard
                        task={item.task}
                        onUpdate={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                        isNewTask={newTaskIds.has(item.task.id)}
                        isMovingUp={movingUpTaskIds.has(item.task.id)}
                        isMovingDown={movingDownTaskIds.has(item.task.id)}
                        activeTask={activeTask}
                      />
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activeTask ? (
                <div className="opacity-90 rotate-3 scale-105 shadow-2xl">
                  <TaskCard
                    task={activeTask}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                    isNewTask={newTaskIds.has(activeTask.id)}
                    isMovingUp={movingUpTaskIds.has(activeTask.id)}
                    isMovingDown={movingDownTaskIds.has(activeTask.id)}
                    isDragging={true}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Statistics */}
          {stats && tasks.length > 0 && (
            <div className="mt-8 text-center">
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {stats.active} {t('taskStates.active')} • {stats.highPriority} {t('taskStates.highPriority')} • {stats.completionRate}% {t('taskStates.completed')}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && tasks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <h3 className="text-lg font-semibold mb-2">{t('emptyState.loading.title')}</h3>
                <p className="text-muted-foreground">
                  {t('emptyState.loading.description')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State - No tasks after loading */}
          {!loading && tasks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">{t('emptyState.noTasks.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('emptyState.noTasks.description')}
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={() => handleAddTask({
                    title: t('buttons.newTask'),
                    description: '',
                    completed: false,
                    priority: false,
                    tags: [],
                    subtasks: [],
                    globalPosition: Date.now(),
                    userId: 'temp-user' // Will be set by API
                  })}>
                    <Plus className="h-4 w-4 mr-1" />
                    {t('buttons.newTask')}
                  </Button>
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-1" />
                    {t('buttons.newGoal')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}