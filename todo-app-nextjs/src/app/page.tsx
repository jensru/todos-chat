// src/app/page.tsx - Main App with Professional Architecture
'use client';

import { Plus, Target, MessageCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter, DragOverEvent, MeasuringStrategy, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
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
function SortableTaskCard({ task, dateKey, onUpdate, onDelete }: {
  task: any;
  dateKey: string;
  onUpdate: (taskId: string, updates: Partial<any>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
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
      task,
      dateKey
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition || 'transform 200ms ease'),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    pointerEvents: isDragging ? 'none' : 'auto',
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

export default function HomePage(): JSX.Element {
  const {
    tasks,
    loading,
    handleTaskUpdate,
    handleTaskDelete,
    handleAddTask,
    getTaskStats,
    groupedTasks,
    formatDate,
    handleReorderWithinDate,
    handleMoveTaskToDate,
    handleReorderAcrossDates
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
    const overTask = over.data.current?.task;

    if (!activeTask || !overTask) return;

    const activeDateKey = activeTask.dueDate ? activeTask.dueDate.toISOString().split('T')[0] : 'ohne-datum';
    const overDateKey = overTask.dueDate ? overTask.dueDate.toISOString().split('T')[0] : 'ohne-datum';

    if (activeDateKey === overDateKey) {
      // Same date - reorder
      const dateTasks = groupedTasks[activeDateKey] || [];
      const activeIndex = dateTasks.findIndex(t => t.id === activeId);
      const overIndex = dateTasks.findIndex(t => t.id === overId);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newOrder = arrayMove(dateTasks, activeIndex, overIndex);
        const taskIds = newOrder.map(t => t.id);
        await handleReorderWithinDate(activeDateKey, taskIds);
      }
    } else {
      // Different date - move task
      const targetDateTasks = groupedTasks[overDateKey] || [];
      const overIndex = targetDateTasks.findIndex(t => t.id === overId);
      
      if (overIndex !== -1) {
        await handleReorderAcrossDates(activeId as string, overTask.dueDate, overIndex);
      } else {
        await handleMoveTaskToDate(activeId as string, overTask.dueDate);
      }
    }
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
            <div className="space-y-6">
              {Object.entries(groupedTasks).map(([dateKey, dateTasks]) => (
                <div key={dateKey}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    {formatDate(dateKey)}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({dateTasks.length})
                    </span>
                  </h3>
                  
                  <SortableContext 
                    items={dateTasks.map(t => t.id)} 
                    strategy={verticalListSortingStrategy}
                    id={`sortable-${dateKey}`}
                  >
                    <div className="space-y-2">
                      {dateTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          dateKey={dateKey}
                          onUpdate={handleTaskUpdate}
                          onDelete={handleTaskDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>
            
            <DragOverlay>
              {activeTask ? (
                <div className="opacity-50">
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