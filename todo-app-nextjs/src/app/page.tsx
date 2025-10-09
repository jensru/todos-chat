// src/app/page.tsx - Main App with Professional Architecture
'use client';

import { Plus, Target, MessageCircle, Calendar, CheckCircle2, Mic, MicOff, Trash2 } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter, DragOverEvent, MeasuringStrategy, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { TaskCardRefactored as TaskCard } from '@/components/TaskCardRefactored';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGoals } from '@/hooks/useGoals';
import { useMistralChat } from '@/hooks/useMistralChat';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';

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
function SortableTaskCard({ task, onUpdate, onDelete, activeTask }: {
  task: any;
  onUpdate: (taskId: string, updates: Partial<any>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  activeTask?: any;
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

export default function HomePage(): JSX.Element {
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
    handleTaskUpdateOptimistic
  } = taskManagement;
  

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
    getTaskStats
  };

  const { goals } = useGoals();

  // Audio input state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Chat scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  const stats = getTaskStats();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'de-DE';
      
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
    }
  }, []);

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
    <div className="flex h-screen bg-background">
      {/* Chat Panel */}
      <div className="w-full lg:w-1/3 lg:max-w-[500px] border-r border-border bg-muted/30 flex flex-col h-screen">
        <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold">KI-Assistent</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            title="Chat-Verlauf löschen"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-8'
                  : 'bg-muted mr-8'
              }`}
            >
              {message.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              placeholder="Nachricht eingeben..."
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

      {/* Canvas Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
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
                {stats.active} aktiv • {stats.highPriority} High Priority • {stats.completionRate}% erledigt
              </div>
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">Keine Aufgaben</h3>
                <p className="text-muted-foreground mb-4">
                  Deine Aufgaben & Ziele erscheinen hier. Fang einfach im Chat an.
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={() => handleAddTask({
                    title: 'Neue Aufgabe',
                    description: '',
                    completed: false,
                    priority: false,
                    tags: [],
                    subtasks: [],
                    globalPosition: Date.now()
                  })}>
                    <Plus className="h-4 w-4 mr-1" />
                    Neue Aufgabe
                  </Button>
                  <Button variant="outline">
                    <Target className="h-4 w-4 mr-1" />
                    Neues Ziel
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