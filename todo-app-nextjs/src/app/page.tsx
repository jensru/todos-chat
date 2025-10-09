// src/app/page.tsx - Main App with Professional Architecture
'use client';

import { Plus, Target, MessageCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter, DragOverEvent, MeasuringStrategy, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { TaskCardRefactored as TaskCard } from '@/components/TaskCardRefactored';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGoals } from '@/hooks/useGoals';
import { useMistralChat } from '@/hooks/useMistralChat';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useState } from 'react';
import type { JSX } from 'react';

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
    <div ref={setNodeRef} style={style} className="my-6">
      <h3 className="text-lg font-semibold px-4 py-3 bg-muted/20 rounded-lg text-center">
        {formatDate(dateKey)}
        <span className="ml-2 text-sm text-muted-foreground">
          ({taskCount})
        </span>
      </h3>
    </div>
  );
}

export default function HomePage(): JSX.Element {
  const {
    tasks,
    loading,
    handleTaskUpdate,
    handleTaskDelete,
    handleAddTask,
    getTaskStats,
    groupedTasks,
    formatDate
  } = useTaskManagement();

  const {
    messages,
    chatInput,
    setChatInput,
    handleSendMessage
  } = useMistralChat();

  const { goals } = useGoals();

  const stats = getTaskStats();

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

    if (!over || !active) return;

    const activeId = active.id;
    const overId = over.id;

    // If dropped on the same position, do nothing
    if (activeId === overId) return;

    const activeTask = active.data.current?.task;
    const overElement = over.data.current;

    if (!activeTask || !overElement) return;

    // Get flat list of all items (headers + tasks)
    const flatList = getFlatList();
    const activeIndex = flatList.findIndex(item => item.id === activeId);
    const overIndex = flatList.findIndex(item => item.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    // Calculate new position based on drop target
    let newDate: Date | null = null;
    let newPosition = Date.now();

    if (overElement.type === 'date-header') {
      // Dropped on date header - change date
      newDate = overElement.date;
      newPosition = Date.now();
    } else if (overElement.type === 'task') {
      // Dropped on task - keep same date, adjust position
      newDate = overElement.task.dueDate || null;
      newPosition = overElement.task.globalPosition;
    }

    // Update task with new date and position
    await handleTaskUpdate(activeTask.id, {
      dueDate: newDate || undefined,
      globalPosition: newPosition,
      updatedAt: new Date()
    });
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
      
      // Add tasks for this date
      dateTasks.forEach(task => {
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
      <div className="w-full lg:w-1/3 lg:max-w-[500px] border-r border-border bg-muted/30">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Chat
          </h2>
        </div>
        <div className="p-4 space-y-4">
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
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Nachricht eingeben..."
              className="flex-1"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage({ tasks: tasks.length, goals: goals.length });
                }
              }}
            />
            <Button onClick={() => handleSendMessage({ tasks: tasks.length, goals: goals.length })}>Send</Button>
          </div>
        </div>
      </div>

      {/* Canvas Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Canvas
            </h1>
            {stats && (
              <div className="text-sm text-muted-foreground flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {stats.active} aktiv • {stats.highPriority} High Priority • {stats.completionRate}% erledigt
              </div>
            )}
          </div>

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