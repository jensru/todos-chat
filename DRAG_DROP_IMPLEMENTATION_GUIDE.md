# Drag & Drop Implementation Guide

## 🎯 Was wir erreichen wollen (UX-Anforderungen – ohne Technik)

1) Einfaches Reorder-Erlebnis
- Nur Task-zu-Task Drops. Header sind nicht droppable (explizit deaktiviert).
- Innerhalb eines Tages: Drag über einen Task
  - Drop „nach oben“ ⇒ der gezogene Task steht direkt über dem Ziel-Task
  - Drop „nach unten“ ⇒ der gezogene Task steht direkt unter dem Ziel-Task
  - Drop auf den letzten Task „nach unten“ ⇒ der gezogene Task steht am Ende des Tages

2) Tageswechsel per Drag
- Tageswechsel erfolgt ausschließlich durch Drop auf einen anderen Task der Zielgruppe (vor/hinter diesen Task). Drop auf Gruppen-Header ist deaktiviert.
- Beim Ziehen über Tagesgrenzen zeigt die Liste weiterhin die Ziel-Position anhand der Task-zu-Task-Hover-Position (kein Header-Drop mehr).

3) Reaktionsschnell und stabil
- Keine unendlichen Ladevorgänge oder Flackern.
- Animationen sind dezent und stören nicht.
- Keine neuen Gesten lernen müssen – „oben/unter den Ziel-Task“ genügt.
6. **Reihenfolge innerhalb eines Tages anpassen:** Beim Drag & Drop innerhalb derselben Tagesgruppe wird die Liste im Ziel-Tag sofort visuell neu angeordnet und die neue Reihenfolge persistiert.

## 🚨 **Aktuelle Probleme:**

### **1. Unendliche API-Calls (KRITISCH)**
```
API Debug - Starting GET /api/tasks
API Debug - User authenticated: 22b4d68f-0f2f-4055-a920-5faa87179721
API Debug - Found 89 tasks
GET /api/tasks 200 in 96ms
```
**Problem:** `useTaskManagement.ts` hat `tasks` in den Dependencies von `useCallback` Hooks
**Auswirkung:** Jeder Task-Update triggert `loadData()` → unendliche Schleife
**Status:** ❌ NICHT BEHOBEN - Änderungen haben nicht funktioniert

### **2. Falsche Drag & Drop Positionierung**
**Problem:** Tasks landen nicht an der korrekten Position
**Aktuelle Logik:**
```typescript
const movingDown = activeTask.globalPosition < overTask.globalPosition;
let newPosition: number;
if (movingDown) {
  newPosition = overTask.globalPosition + 1000; // Nach unten
} else {
  newPosition = overTask.globalPosition - 1000; // Nach oben
}
```
**Status:** ❓ UNGETESTET - Wegen Problem #1

### **3. Header-Drops deaktiviert**
**Status:** ✅ KORREKT - Header sind nicht droppable (Droppable-Registrierung entfernt, Drops auf Header werden ignoriert)

## 🔧 **Technische Implementierung:**

### **Aktuelle Architektur:**
```typescript
// page.tsx - handleDragEnd
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  setActiveTask(null);

  if (!over || !active.data.current) return;

  const activeTask = active.data.current.task;
  const overElement = over.data.current;

  // Nur Task-zu-Task Drops erlauben
  if (overElement.type !== 'task') {
    // Drop auf Header ist deaktiviert/ignoriert
    return;
  }

  const overTask = overElement.task;
  const sourceDateKey = activeTask.dueDate ? formatDateToYYYYMMDD(activeTask.dueDate) : 'ohne-datum';
  const targetDateKey = overTask.dueDate ? formatDateToYYYYMMDD(overTask.dueDate) : 'ohne-datum';

  if (sourceDateKey === targetDateKey) {
    // Innerhalb eines Tages neu anordnen
    const dateTasks = (groupedTasks[sourceDateKey] || []).slice().sort((a, b) => a.globalPosition - b.globalPosition);
    const currentIndex = dateTasks.findIndex(t => t.id === activeTask.id);
    const overIndex = dateTasks.findIndex(t => t.id === overTask.id);
    if (currentIndex === -1 || overIndex === -1 || activeTask.id === overTask.id) return;
    const movingDown = currentIndex < overIndex;
    const withoutActive = dateTasks.filter(t => t.id !== activeTask.id);
    const insertIndex = Math.max(0, overIndex + (movingDown ? 1 : 0) - (currentIndex < overIndex ? 1 : 0));
    withoutActive.splice(insertIndex, 0, dateTasks[currentIndex]);
    const newIds = withoutActive.map(t => t.id);
    await handleReorderWithinDate(sourceDateKey, newIds);
    return;
  }

  // Über Tagesgrenzen verschieben, Position exakt bestimmen
  const targetList = (groupedTasks[targetDateKey] || []).slice().sort((a, b) => a.globalPosition - b.globalPosition);
  const overIndex = targetList.findIndex(t => t.id === overTask.id);
  const movingDown = activeTask.globalPosition < overTask.globalPosition;
  const targetIndex = Math.max(0, (overIndex === -1 ? targetList.length : overIndex) + (movingDown ? 1 : 0));
  await handleReorderAcrossDates(activeTask.id, overTask.dueDate ?? null, targetIndex);
};
```

### **Problem-Quellen:**

#### **1. useTaskManagement.ts Dependencies:**
```typescript
// PROBLEM: tasks in Dependencies
const loadData = useCallback(async (): Promise<void> => {
  // ... load logic
}, [taskService, tasks]); // ❌ tasks verursacht unendliche Schleife

const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
  // ... update logic
}, [taskService, tasks]); // ❌ tasks verursacht unendliche Schleife
```

#### **2. Optimistic Updates:**
```typescript
const handleTaskUpdateOptimistic = useCallback(async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
  // Update state immediately for smooth animation
  setTasks(prevTasks =>
    prevTasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    )
  );

  // Try to update in the service
  try {
    const success = await taskService.updateTask(taskId, updates);
    if (!success) {
      await loadData(); // ❌ Triggert unendliche Schleife
      return false;
    }
    return true;
  } catch (error) {
    await loadData(); // ❌ Triggert unendliche Schleife
    return false;
  }
}, [taskService, loadData]); // ❌ loadData hat tasks dependency
```

## 🎯 **Lösungsansätze:**

### **1. Dependencies Fix (PRIORITÄT 1):**
```typescript
// ✅ KORREKT: tasks aus Dependencies entfernen
const loadData = useCallback(async (): Promise<void> => {
  // ... load logic
}, [taskService]); // Nur taskService

const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
  // ... update logic
}, [taskService]); // Nur taskService
```

### **2. Optimistic Updates & Drag-Over-Vorschau:**
```typescript
// ✅ KORREKT: Keine loadData calls in error handling
const handleTaskUpdateOptimistic = useCallback(async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
  // Update state immediately
  setTasks(prevTasks =>
    prevTasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    )
  );

  try {
    const success = await taskService.updateTask(taskId, updates);
    if (!success) {
      // ❌ NICHT: await loadData();
      // ✅ STATTDESSEN: Revert state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      return false;
    }
    return true;
  } catch (error) {
    // ❌ NICHT: await loadData();
    // ✅ STATTDESSEN: Revert state
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    return false;
  }
}, [taskService]); // Nur taskService
```

```typescript
// ✅ Drag-Over-Vorschau: Während des Drag-Over wird der aktive Task in die Zielgruppe vorgesortiert,
// sodass sich die Tagesheader visuell mit verschieben.
const getEffectiveGroupedTasks = () => {
  if (!activeTask || !overItem || overItem.type !== 'task') return groupedTasks;
  const overTask = overItem.task;
  const targetDateKey = overTask.dueDate ? formatDateToYYYYMMDD(overTask.dueDate) : 'ohne-datum';
  const copy = Object.fromEntries(Object.entries(groupedTasks).map(([k,v]) => [k, v.slice()]));
  Object.keys(copy).forEach(k => { copy[k] = copy[k].filter(t => t.id !== activeTask.id); });
  if (!copy[targetDateKey]) copy[targetDateKey] = [];
  const list = copy[targetDateKey];
  const overIndex = list.findIndex(t => t.id === overTask.id);
  const movingDown = activeTask.globalPosition < overTask.globalPosition;
  const insertIndex = Math.max(0, (overIndex === -1 ? list.length : overIndex) + (movingDown ? 1 : 0));
  list.splice(insertIndex, 0, { ...activeTask, dueDate: overTask.dueDate });
  const baseTime = Date.now();
  copy[targetDateKey] = list.map((t, idx) => ({ ...t, globalPosition: baseTime + idx }));
  return copy;
}
```

### **3. Positionierung Testen:**
Nach Fix der API-Calls die Drag & Drop Positionierung testen und ggf. anpassen.

## 📋 **Debugging Checklist:**

### **API-Calls stoppen:**
- [ ] `tasks` aus allen `useCallback` Dependencies entfernen
- [ ] `loadData` calls in error handling entfernen
- [ ] State reversion statt reload verwenden
- [ ] Terminal auf unendliche API-Calls prüfen

### **Drag & Drop testen:**
- [ ] Task nach oben schieben → landet VOR Ziel-Task
- [ ] Task nach unten schieben → landet NACH Ziel-Task
- [ ] Task zwischen Header und erstem Task → Position 1
- [ ] Task zwischen letztem Task und Header → Letzte Position des darüberliegenden Tages
- [ ] Datum wird korrekt übernommen
- [x] Header-Drops sind deaktiviert (nur Task-zu-Task)
- [ ] Beim Drag-Over verschieben sich die Tagesheader visuell korrekt mit

### **Performance prüfen:**
- [ ] Keine unendlichen API-Calls
- [ ] Smooth Animationen
- [ ] Keine Memory Leaks

## 🚀 **Nächste Schritte:**

1. **KRITISCH:** Unendliche API-Calls stoppen
2. **Drag & Drop Positionierung testen** - Besonders Edge Cases zwischen Header und Tasks
3. **Performance optimieren**
4. **Edge Cases abfangen**

---

**Letzte Aktualisierung:** $(date)
**Status:** 🚨 KRITISCHE PROBLEME - Unendliche API-Calls müssen sofort behoben werden
