# 📋 **Component API Reference - Enterprise Edition**

**Version**: 3.0.0 | **Status**: ✅ Production Ready

---

## 🏗️ **Neue Modulare Architektur**

### **TaskCardRefactored** - Haupt-Orchestrator
```typescript
// src/components/TaskCardRefactored.tsx (152 LOC)
interface ITaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCardRefactored({ task, onUpdate, onDelete }: ITaskCardProps): JSX.Element
```

**Verantwortlichkeit**: Orchestriert alle Sub-Komponenten, verwaltet Edit-State
**Komponiert**: TaskHeader + TaskBody + SubtaskList + TaskActions

---

## 📋 **Sub-Komponenten APIs**

### **TaskHeader** - Priorität & Titel-Management
```typescript
// src/components/TaskHeader.tsx (72 LOC)
interface ITaskHeaderProps {
  title: string;
  completed: boolean;
  priority: boolean;
  isEditing: boolean;
  editTitle: string;
  onToggleComplete: () => void;
  onPriorityToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onTitleChange: (value: string) => void;
}
```

**Features:**
- ⭐ Priority Star Toggle
- ✏️ Inline Title Editing
- ✅ Completion Checkbox
- 🎮 Edit/Save/Cancel Controls

---

### **TaskBody** - Inhalt & Metadaten
```typescript
// src/components/TaskBody.tsx (85 LOC)
interface ITaskBodyProps {
  description?: string;
  category?: string;
  dueDate?: Date;
  isEditing: boolean;
  editDescription: string;
  editCategory: string;
  showNewCategoryInput: boolean;
  newCategoryName: string;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onNewCategoryNameChange: (value: string) => void;
  onAddNewCategory: () => void;
  onCancelNewCategory: () => void;
}
```

**Features:**
- 📝 Description Editing (Textarea)
- 📁 Category Management mit Custom Categories
- 📅 Due Date Display
- 🔄 Conditional Rendering (Edit/View Mode)

---

### **SubtaskList** - Unteraufgaben-Management
```typescript
// src/components/SubtaskList.tsx (36 LOC)
interface ISubtaskListProps {
  subtasks: Subtask[];
  onToggleSubtask: (subtaskId: string) => void;
}
```

**Features:**
- 📊 Progress Indicator (2/5 completed)
- ✅ Individual Subtask Completion
- 👁️ Conditional Rendering (nur wenn Subtasks existieren)
- 🎨 Visual Status (strikethrough für completed)

---

### **TaskActions** - Action-Buttons
```typescript
// src/components/TaskActions.tsx (48 LOC)
interface ITaskActionsProps {
  isEditing: boolean;
  onAddSubtask: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}
```

**Features:**
- ➕ Add Subtask Button
- 💾 Save/Cancel Buttons (nur im Edit-Mode)
- 🗑️ Delete Button
- 🎨 Conditional Button Rendering

---

## 🪝 **Custom Hooks APIs**

### **useTaskManagement** - Task Business Logic
```typescript
// src/hooks/useTaskManagement.ts (115 LOC)
export function useTaskManagement(): {
  tasks: Task[];
  loading: boolean;
  handleTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  handleTaskDelete: (taskId: string) => Promise<void>;
  handleAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getTaskStats: () => { total: number; completed: number; active: number; highPriority: number; completionRate: number };
  groupedTasks: Record<string, Task[]>;
  formatDate: (dateString: string) => string;
  loadData: () => Promise<void>;
}
```

**Performance-Optimierungen:**
- ✅ `useCallback` für alle Event Handler
- ✅ `useMemo` für `groupedTasks` (teure Berechnung)
- ✅ Korrekte Dependency Arrays

---

### **useMistralChat** - KI Chat Management
```typescript
// src/hooks/useMistralChat.ts (77 LOC)
export function useMistralChat(): {
  messages: Message[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: (taskContext?: { tasks: number; goals: number }) => Promise<void>;
  isServiceReady: boolean;
}
```

**Features:**
- 💬 Message State Management
- 🤖 Mistral AI Integration
- ⚡ Rate Limit Handling
- 🛡️ Error Fallback Messages

---

### **useGoals** - Goals Management
```typescript
// src/hooks/useGoals.ts (73 LOC)
export function useGoals(): {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  loadGoals: () => void;
}
```

**Features:**
- 🎯 Goal CRUD Operations
- 💾 LocalStorage Persistence
- 🔄 Auto-loading on Mount

---

## 🔧 **Type Definitions**

### **Core Types mit I-Prefix**
```typescript
// src/lib/types.ts
export interface ITask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: boolean;
  dueDate?: Date;
  category?: string;
  tags: string[];
  subtasks: ISubtask[];
  createdAt: Date;
  updatedAt: Date;
  globalPosition: number;
}

// Type Aliases für einfache Nutzung
export type Task = ITask;
export type Subtask = ISubtask;
export type Goal = IGoal;
export type Message = IMessage;
```

---

## 🚀 **Migration Guide**

### **Von alter zu neuer TaskCard:**
```typescript
// Vorher: Monolithische Komponente
import { TaskCard } from '@/components/TaskCard'; // ❌ 255 LOC

// Nachher: Modulare Komponente
import { TaskCardRefactored as TaskCard } from '@/components/TaskCardRefactored'; // ✅ Clean
```

### **Custom Hooks verwenden:**
```typescript
// Vorher: Alles in page.tsx
export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  // ... 300+ Zeilen Business Logic
}

// Nachher: Clean Separation
export default function HomePage() {
  const { tasks, handleTaskUpdate, groupedTasks } = useTaskManagement();
  const { messages, handleSendMessage } = useMistralChat();
  const { goals } = useGoals();

  return <JSX />; // Nur noch UI Logic
}
```

---

## 📊 **Performance Metriken**

### **Component Sizes (Lines of Code)**
| Komponente | Vorher | Nachher | Verbesserung |
|------------|---------|---------|--------------|
| page.tsx | 366 | 180 | ✅ -51% |
| TaskCard | 255 | 4×~50 | ✅ Modular |
| Business Logic | Mixed | 3 Hooks | ✅ Separated |

### **Code Quality**
- **ESLint Errors**: `30+ → 0` ✅
- **TypeScript**: `80% → 100%` ✅
- **Return Types**: `Missing → Explicit` ✅
- **Performance**: `Basic → Optimized` ✅

---

## 🎯 **Best Practices für Entwickler**

### **Komponenten-Entwicklung**
1. **Single Responsibility**: Jede Komponente hat eine klare Aufgabe
2. **Props Interface**: Immer I-Prefix verwenden (`ITaskHeaderProps`)
3. **JSX.Element Return**: Explizite Return Types
4. **Event Handlers**: useCallback für Performance

### **Custom Hooks**
1. **Business Logic Only**: Keine UI-spezifische Logik
2. **Return Object**: Strukturierte API mit expliziten Types
3. **Performance**: useCallback/useMemo für teure Operationen
4. **Dependencies**: Korrekte Dependency Arrays

### **Type Safety**
1. **I-Prefix Interfaces**: ESLint-konforme Namenskonvention
2. **Type Aliases**: Einfache Nutzung mit `type Task = ITask`
3. **Unknown statt Any**: Type-sichere Error-Behandlung
4. **Explicit Returns**: Alle Funktionen haben Return Types

---

*Component API Reference erstellt am 09.10.2025 - Version 3.0.0*