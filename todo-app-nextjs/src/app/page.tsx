// src/app/page.tsx - Main App with Professional Architecture
'use client';

import { Plus, Target, MessageCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MistralService } from '@/lib/services/MistralService';
import { TaskService } from '@/lib/services/TaskService';
import { Task, Goal, Message, WorkingStyleDNA } from '@/lib/types';

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'bot', text: 'Hey, woran willst du heute arbeiten?', timestamp: new Date() }
  ]);
  const [taskService] = useState(() => new TaskService());
  const [mistralService, setMistralService] = useState<MistralService | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    loadData();
    
    // Initialize MistralService after component mounts (client-side only)
    if (typeof window !== 'undefined') {
      console.log('Initializing MistralService...');
      try {
        setMistralService(new MistralService());
        console.log('MistralService initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MistralService:', error);
        setMistralService(null);
      }
    }
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading data...');
      
      // Load tasks directly without timeout for now
      const loadedTasks = await taskService.loadTasks();
      console.log('Loaded tasks:', loadedTasks.length);
      setTasks(loadedTasks);
      
      // Load other data from localStorage
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('todo-app-data');
        if (savedData) {
          const data = JSON.parse(savedData);
          setGoals(data.goals || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty tasks if loading fails
      setTasks([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    const success = await taskService.updateTask(taskId, updates);
    if (success) {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    const success = await taskService.deleteTask(taskId);
    if (success) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const success = await taskService.addTask(taskData);
    if (success) {
      await loadData(); // Reload to get the new task
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Generate AI response
    if (mistralService) {
      try {
        console.log('Generating AI response for:', userMessage);
        const aiResponse = await mistralService.generateSmartResponse(userMessage, {
          tasks: tasks.length,
          goals: goals.length
        });

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error generating AI response:', error);
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
  };

  const groupedTasks = tasks
    .filter(task => !task.completed) // Nur aktive Tasks anzeigen
    .reduce((acc, task) => {
      let dateKey = 'ohne-datum';
      
      if (task.dueDate) {
        try {
          // Prüfe ob das Datum gültig ist
          if (!isNaN(task.dueDate.getTime())) {
            const taskDate = task.dueDate.toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            
            // Nur heute und zukünftige Tage anzeigen
            if (taskDate >= today) {
              dateKey = taskDate;
            } else {
              return acc; // Vergangene Tasks überspringen
            }
          }
        } catch (error) {
          console.warn('Invalid dueDate for task:', task.id, task.dueDate);
          dateKey = 'ohne-datum';
        }
      }
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

  const formatDate = (dateString: string) => {
    if (dateString === 'ohne-datum') return 'Ohne Datum';
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      if (dateString === today.toISOString().split('T')[0]) {
        return 'Heute';
      } else if (dateString === tomorrow.toISOString().split('T')[0]) {
        return 'Morgen';
      } else {
        return date.toLocaleDateString('de-DE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
      }
    } catch (error) {
      return 'Ungültiges Datum';
    }
  };

  const stats = taskService.getTaskStats();

  // Debug: Log task information
  console.log('Total tasks:', tasks.length);
  console.log('Active tasks:', tasks.filter(task => !task.completed).length);
  console.log('Completed tasks:', tasks.filter(task => task.completed).length);
  console.log('Grouped tasks:', Object.keys(groupedTasks).length);

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
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage}>Send</Button>
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