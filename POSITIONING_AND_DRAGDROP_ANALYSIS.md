# 📊 Positionierungs- und Drag-Drop-Logik - Vollständige Analyse

## 🎯 Überblick

Die Todo-App verwendet ein **globalPosition-basiertes System** zur Verwaltung der Task-Ordnung. Die Positionen werden sowohl **im Frontend (visuell)** als auch **im Backend (persistent)** verwaltet.

---

## 🔢 Positionierungssystem - globalPosition

### Position-Encoding: YYYYMMDDPP

Das System verwendet eine **8-stellige Zahl** als eindeutige Position:

```
Struktur: YYYYMMDD + PP
          ↓          ↓
          Datum    Position im Datum
          
Beispiele:
- 20251020 + 01 = 2025102001  (20.10.2025, Task 1)
- 20251020 + 02 = 2025102002  (20.10.2025, Task 2)
- 20251020 + 99 = 2025102099  (20.10.2025, Task 99 - neu hinzugefügt)
- 99999901 = "ohne-datum" Gruppe, Task 1
```

### Datum ohne Fälligkeitsdatum

Tasks ohne `dueDate` werden in die Gruppe `ohne-datum` mit Position `999999XX` verschoben:
- `99999901` = erste Task ohne Datum
- `99999902` = zweite Task ohne Datum
- `99999999` = letzte Task ohne Datum

### Sortierung

Auf **Backend- und Frontend-Ebene** werden Tasks nach `globalPosition` aufsteigend sortiert:

```typescript
tasks.sort((a, b) => a.globalPosition - b.globalPosition);
```

Dies garantiert, dass die Reihenfolge **überall konsistent** ist.

---

## 📦 Frontend-Architektur

### 1. **Komponenten-Hierarchie**

```
HomePage (src/app/page.tsx)
├── DndContext (dnd-kit Library)
│   ├── SortableContext (flat list)
│   │   ├── SortableDateHeader (für jedes Datum)
│   │   ├── SortableTaskCard (für jede Task)
│   │   │   └── TaskCardRefactored (UI-Rendering)
│   │   ├── SortableDateHeader (nächstes Datum)
│   │   └── SortableTaskCard (nächste Task)
│   └── DragOverlay (visuelles Feedback während Drag)
└── Chat-Panel
```

### 2. **Gruppierung und Sortierung (Hook)**

Die `useTaskManagement()`-Hook gruppiert Tasks nach Datum:

```typescript
// src/hooks/useTaskManagement.ts - getGroupedTasks
const groupedTasks = useMemo(() => {
  const today = getTodayAsYYYYMMDD();
  
  const grouped = tasks
    .filter(task => !task.completed)  // Nur aktive Tasks
    .reduce((acc, task) => {
      let dateKey = 'ohne-datum';
      let isOverdue = false;

      if (task.dueDate) {
        const taskDate = formatDateToYYYYMMDD(task.dueDate);
        
        // Überfällige Tasks gehören zu "Heute"
        if (taskDate < today) {
          isOverdue = true;
          dateKey = today;  // ← WICHTIG: visuell in Heute-Gruppe
        } else {
          dateKey = taskDate;
        }
      }

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push({ ...task, isOverdue, displayDate: ... });
      return acc;
    }, {});

  // Sortiere nach Datum (Heute oben)
  const sorted = Object.entries(grouped)
    .sort(([a], [b]) => {
      if (a === today) return -1;  // Heute immer oben
      if (b === today) return 1;
      return a.localeCompare(b);
    });

  // Sortiere Tasks INNERHALB jeder Gruppe nach globalPosition
  sorted.forEach(([, tasks]) => {
    tasks.sort((a, b) => a.globalPosition - b.globalPosition);
  });

  return Object.fromEntries(sorted);
}, [tasks]);
```

**Reihenfolge-Logik:**
1. **Nach Datum**: Heute → Morgen → Übermorgen → ... → ohne-datum
2. **Innerhalb eines Datums**: Nach `globalPosition` aufsteigend

### 3. **DndContext Setup (Drag & Drop)**

```typescript
// src/app/page.tsx - Sensoren und Strategien
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
);

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  measuring={{strategy: MeasuringStrategy.WhileDragging}}
  onDragStart={handleDragStart}
  onDragMove={handleDragMove}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={flatListIds} strategy={verticalListSortingStrategy}>
    {/* Rendering mit Flat List */}
  </SortableContext>
</DndContext>
```

**Wichtige Settings:**
- **closestCenter**: Findet den nächsten Drop-Ziel-Element
- **WhileDragging**: Messung während des Ziehens, nicht beim Start
- **verticalListSortingStrategy**: Eindimensionale Sortierung (oben-unten)

---

## 🎯 Drag & Drop Logik

### Flache Liste (Flat List)

Die **gesamte** UI wird als **eine flache Liste** gerendert:

```typescript
// getFlatList() - kombiniert Headers und Tasks
function getFlatList(): FlatListItem[] {
  const flat: FlatListItem[] = [];
  
  Object.entries(groupedTasks).forEach(([dateKey, tasks]) => {
    // Header hinzufügen
    flat.push({
      id: `header-${dateKey}`,
      type: 'date-header',
      dateKey
    });
    
    // Tasks des Datums hinzufügen
    tasks.forEach(task => {
      flat.push({
        id: task.id,
        type: 'task',
        task
      });
    });
  });
  
  return flat;
}
```

**Beispiel einer flachen Liste mit 3 Tagen:**

```
Index  Element
─────────────────────────────────
0      header-2025-10-20
1      Task A (20.10.2025)
2      Task B (20.10.2025)
3      header-2025-10-21
4      Task C (21.10.2025)
5      Task D (21.10.2025)
6      header-ohne-datum
7      Task E (keine Fälligkeit)
```

### Drag-Start Event

```typescript
const handleDragStart = (event: DragStartEvent): void => {
  const { active } = event;
  const taskFromData = active.data.current?.task as TaskWithOverdue;
  setActiveTask(taskFromData ?? null);
  
  // Speichere die aktuelle Gruppe (wird für Animationen verwendet)
  if (taskFromData) {
    const key = taskFromData.displayDate || 'ohne-datum';
    lastOverTaskDateKeyRef.current = key;
  }
};
```

**Was passiert:**
1. Der gezogene Task wird identifiziert
2. Der visuell aktive Task wird gespeichert
3. Die aktuelle Gruppierung wird notiert

### Drag-Move Event

```typescript
const handleDragMove = (event: any): void => {
  const { over } = event;
  const overElement = over?.data?.current as { type?: string; task?: TaskWithOverdue };
  
  if (overElement?.type === 'task' && overElement.task) {
    // Merke: über welcher Gruppe gerade gehovered wird
    const key = overElement.task.displayDate || 'ohne-datum';
    lastOverTaskDateKeyRef.current = key;
  }
};
```

**Was passiert:**
- Während des Ziehens wird registriert, über welcher Task/Gruppe der Cursor ist
- Dies wird verwendet, um später zu wissen, in welche Gruppe der Task gehört

### Drag-End Event (Wichtigster Teil!)

Der `handleDragEnd` arbeitet in mehreren Fällen:

#### **Fall 1: Drop auf Date-Header**

```typescript
if (overElement.type === 'date-header') {
  const flat = getFlatList();
  const headerIdx = flat.findIndex(i => i.id === over.id);
  const activeIdxInFlat = flat.findIndex(i => i.id === active.id);
  
  // Richtung bestimmen: visual index comparison
  const movingDownVisually = activeIdxInFlat < headerIdx;
  
  if (movingDownVisually) {
    // → ANFANG des Ziel-Tags (Index 0)
    await handleReorderAcrossDates(activeTask.id, targetDate, 0);
  } else {
    // → ENDE des vorherigen Tags
    const endIndex = previousList.length;
    await handleReorderAcrossDates(activeTask.id, previousDate, endIndex);
  }
}
```

**Logik:**
- Wenn der aktive Task **vor dem Header** ist: Move zum **Start** des neuen Datums
- Wenn der aktive Task **nach dem Header** ist: Move zum **Ende** des vorherigen Datums

#### **Fall 2: Drop auf Task - Gleiches Datum**

```typescript
if (sourceDateKey === targetDateKey) {
  // Innerhalb desselben Datums
  const dateTasks = (groupedTasks[sourceDateKey] || [])
    .slice()
    .sort((a, b) => a.globalPosition - b.globalPosition)
    .filter(t => t.id !== activeTask.id);
  
  const overIndexInTarget = dateTasks.findIndex(t => t.id === overTask.id);
  const baseInsertIndex = overIndexInTarget === -1 
    ? dateTasks.length 
    : overIndexInTarget;
  
  // Richtung: visueller Index-Vergleich in der Flat-List
  const activeIdxInFlat = flat.findIndex(i => i.id === active.id);
  const overIdxInFlat = flat.findIndex(i => i.id === over.id);
  const shouldInsertAfter = activeIdxInFlat < overIdxInFlat;
  
  const insertIndex = shouldInsertAfter 
    ? baseInsertIndex + 1 
    : baseInsertIndex;
  
  // Neue Reihenfolge berechnen
  const withoutActive = dateTasks.filter(t => t.id !== activeTask.id);
  withoutActive.splice(insertIndex, 0, dateTasks[currentIndex]);
  const newIds = withoutActive.map(t => t.id);
  
  await handleReorderWithinDate(sourceDateKey, newIds);
}
```

**Logik:**
- Finde die Ziel-Task in der Gruppe
- Bestimme, ob VOR oder NACH dieser Task eingefügt werden soll
- Berechne die neue Reihenfolge
- Speichere diese

#### **Fall 3: Drop auf Task - Anderes Datum**

```typescript
// Über Tagesgrenzen verschieben
const targetList = (groupedTasks[targetDateKey] || [])
  .slice()
  .sort((a, b) => a.globalPosition - b.globalPosition);

const overIndex = targetList.findIndex(t => t.id === overTask.id);
const flat = getFlatList();
const activeIdxInFlat = flat.findIndex(i => i.id === active.id);
const overIdxInFlat = flat.findIndex(i => i.id === over.id);

// Richtung basierend auf visueller Position
const shouldInsertAfter = activeIdxInFlat < overIdxInFlat;
const targetIndex = Math.max(0, 
  (overIndex === -1 ? targetList.length : overIndex) + 
  (shouldInsertAfter ? 1 : 0)
);

await handleReorderAcrossDates(activeTask.id, overTask.dueDate, targetIndex);
```

---

## 🔄 Backend-Logik (ApiTaskService)

### Laden von Tasks

```typescript
// src/lib/services/ApiTaskService.ts
async loadTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks');
  return response.json().tasks;
}
```

**Backend-Sortierung** (`src/app/api/tasks/route.ts`):

```typescript
const { data: dbTasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('userId', user.id)
  .order('globalPosition', { ascending: true });  // ← SORTIERT nach Position
```

### Neu anordnen innerhalb eines Datums

```typescript
async reorderTasksWithinDate(dateKey: string, taskIds: string[]): Promise<boolean> {
  const dateString = dateKey === 'ohne-datum' 
    ? '999999' 
    : dateKey.replace(/-/g, '');
  
  // Für jede Task: neue Position berechnen
  for (let i = 0; i < taskIds.length; i++) {
    const taskId = taskIds[i];
    const positionInDate = String(i + 1).padStart(2, '0');
    const newPosition = parseInt(dateString + positionInDate);
    
    await this.updateTask(taskId, { globalPosition: newPosition });
  }
  
  return true;
}
```

**Beispiel:**
- Datum: 20.10.2025 → `20251020`
- Task 0 → Position `2025102001`
- Task 1 → Position `2025102002`
- Task 2 → Position `2025102003`

### Task zwischen Daten verschieben

```typescript
async reorderTasksAcrossDates(
  taskId: string, 
  targetDate: Date | null, 
  targetIndex: number
): Promise<boolean> {
  // Neues Datum setzen
  let dateKey = 'ohne-datum';
  if (targetDate) {
    dateKey = `${targetDate.getFullYear()}-` +
      `${String(targetDate.getMonth() + 1).padStart(2, '0')}-` +
      `${String(targetDate.getDate()).padStart(2, '0')}`;
  }
  
  // Neue Position berechnen
  const dateString = dateKey === 'ohne-datum' 
    ? '999999' 
    : dateKey.replace(/-/g, '');
  const positionInDate = String(targetIndex + 1).padStart(2, '0');
  const newPosition = parseInt(dateString + positionInDate);
  
  // Persistiert zwei Dinge:
  return await this.updateTask(taskId, {
    dueDate: targetDate,           // ← Neues Datum
    globalPosition: newPosition     // ← Neue Position
  });
}
```

---

## 🎨 Frontend-Rendering

### TaskCardRefactored (UI-Komponente)

```typescript
// src/components/TaskCardRefactored.tsx
export function TaskCardRefactored({
  task,
  onUpdate,
  onDelete,
  isDragging,
  dragHandleProps,    // ← Grab-Handle
  dragRef,            // ← Sortierbarer Container
  isNewTask,
  isMovingUp,
  isMovingDown
}): React.JSX.Element {
  return (
    <Card
      ref={dragRef}
      className={`
        transition-all duration-200 
        ${isDragging ? 'opacity-50 shadow-lg' : ''} 
        ${isNew ? 'animate-slide-in' : ''} 
        ${isAnimating ? (isMovingUp ? 'animate-slide-up' : 'animate-slide-down') : ''}
      `}
    >
      <div className="flex items-center">
        <div {...dragHandleProps} className="cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>
        {/* Task Content */}
      </div>
    </Card>
  );
}
```

**Visuelles Feedback:**
- `isDragging`: 50% Opacity + Shadow
- `isNewTask`: Slide-in Animation
- `isMovingUp/Down`: Slide-up oder Slide-down Animation

### Sortierbare Komponente

```typescript
// src/app/page.tsx
function SortableTaskCard({ task, ... }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition || 'transform 200ms ease'),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        dragRef={setNodeRef}
      />
    </div>
  );
}
```

---

## 🔐 Optimistische Updates

### Immediate State Update

```typescript
// src/hooks/useTaskManagement.ts
const handleReorderWithinDate = useCallback(async (dateKey: string, taskIds: string[]) => {
  // 1. Sofort UI aktualisieren
  setTasks(prevTasks => {
    const baseTime = Date.now();
    return prevTasks.map(task => {
      const index = taskIds.indexOf(task.id);
      if (index !== -1) {
        return {
          ...task,
          globalPosition: baseTime + index,  // ← Neue Position
          updatedAt: new Date()
        };
      }
      return task;
    });
  });
  
  // 2. Backend aktualisieren
  const success = await taskService.reorderTasksWithinDate(dateKey, taskIds);
  
  // 3. Bei Fehler: neu laden
  if (!success) {
    await loadData();
  }
}, [taskService, loadData]);
```

**Ablauf:**
1. **Immediate**: UI wird sofort aktualisiert (glatte Animation)
2. **Background**: Backend wird aktualisiert
3. **Error Handling**: Bei Fehler wird neu geladen (Rollback)

---

## 🌍 Zeitzonen-Sicherheit

Die App nutzt **lokales Datum** statt UTC, um Zeitzonen-Probleme zu vermeiden:

```typescript
// ✅ RICHTIG: Lokales Datum
const dateKey = `${date.getFullYear()}-` +
  `${String(date.getMonth() + 1).padStart(2, '0')}-` +
  `${String(date.getDate()).padStart(2, '0')}`;

// ❌ FALSCH: UTC-Datum (kann Offset-Fehler verursachen)
const dateKey = new Date(date).toISOString().split('T')[0];
```

---

## 📈 Überdue-Status

```typescript
// Lokale Logik
const today = getTodayAsYYYYMMDD();  // z.B. "2025-10-20"
const taskDate = formatDateToYYYYMMDD(task.dueDate);  // z.B. "2025-10-18"

const isOverdue = taskDate < today;  // "2025-10-18" < "2025-10-20" = true

// Visuelle Gruppierung
if (isOverdue) {
  dateKey = today;  // Überfällige Tasks in "Heute"-Gruppe anzeigen
}
```

---

## 🔄 Synchronisations-Flow

```
Benutzer Aktion
        ↓
   handleDragEnd()
        ↓
[1] Visueller Vergleich (Flat-List Index)
[2] Neue Position berechnen
[3] handleReorderWithinDate() oder handleReorderAcrossDates()
        ↓
[4] Optimistic State Update (sofort)
        ↓
[5] Backend API Call (async)
        ├─ Success: Bleibt im State
        └─ Error: loadData() (Rollback)
```

---

## ✅ Testmatrix

| Szenario | Erwartetes Verhalten |
|----------|---------------------|
| Task oben schieben (selbes Datum) | Task steht VOR Ziel-Task |
| Task unten schieben (selbes Datum) | Task steht NACH Ziel-Task |
| Task über Header nach unten | Task an START des neuen Datums |
| Task über Header nach oben | Task am ENDE des vorherigen Datums |
| Neue Task hinzufügen | Erscheint am Ende des Datums |
| Task als erledigt markieren | Verschwindet aus aktiver Liste |
| Task überfällig wird | Wird zu "Heute" verschoben |
| Position aktualisieren | globalPosition im Backend auch aktualisiert |

---

## 📊 Datenbank-Schema (Supabase)

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  priority BOOLEAN DEFAULT false,
  dueDate TEXT,              -- YYYY-MM-DD format
  category TEXT,
  tags JSONB,
  subtasks JSONB,
  globalPosition INTEGER,    -- ← WICHTIG: Position (YYYYMMDDPP)
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES auth.users(id)
);

CREATE INDEX tasks_user_position ON tasks(userId, globalPosition);
```

---

## 🎯 Wichtige Prinzipien

1. **globalPosition ist das Quellsystem** für Reihenfolge
2. **Flat List Index wird für Richtung verwendet** (visueller Vergleich)
3. **Lokalzeit, nicht UTC** (verhindert Zeitzonen-Fehler)
4. **Optimistic Updates** (glatte UI, Error Handling via Reload)
5. **Keine Live-Datenmanipulation** während Drag (nur beim Drop)
6. **Gruppierung nach Datum**, dann **Sortierung nach Position** innerhalb Gruppe


