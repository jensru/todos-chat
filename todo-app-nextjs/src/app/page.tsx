// src/app/page.tsx - Main App with Professional Architecture
'use client';

import { Plus, Target, MessageCircle, Calendar, CheckCircle2 } from 'lucide-react';

import { TaskCardRefactored as TaskCard } from '@/components/TaskCardRefactored';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGoals } from '@/hooks/useGoals';
import { useMistralChat } from '@/hooks/useMistralChat';
import { useTaskManagement } from '@/hooks/useTaskManagement';

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
                
                <div className="space-y-3">
                  {dateTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={handleTaskUpdate}
                      onDelete={handleTaskDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

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