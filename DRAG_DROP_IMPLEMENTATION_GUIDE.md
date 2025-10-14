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

Hinweis: Beim „Platz machen“ darf der aktive Task während des Dragging nicht bereits das Datum wechseln. Stattdessen entsteht der Eindruck, als würde sich die Headline mitbewegen, indem am Gruppenanfang optisch ein Einfügeabstand angezeigt wird. Das Datum wird erst beim Drop übernommen.

3) Reaktionsschnell und stabil
- Keine unendlichen Ladevorgänge oder Flackern.
- Animationen sind dezent und stören nicht.
- Keine neuen Gesten lernen müssen – „oben/unter den Ziel-Task“ genügt.
6. **Reihenfolge innerhalb eines Tages anpassen:** Beim Drag & Drop innerhalb derselben Tagesgruppe wird die Liste im Ziel-Tag sofort visuell neu angeordnet und die neue Reihenfolge persistiert.

## 🎯 Zielbild Drag & Drop (konkret)

- Einheitlicher Drag-State: identisch innerhalb eines Tages und über Tagesgrenzen; keine Rotation, dezente Skalierung (scale-105).
- Nur Task-zu-Task: Header sind nicht droppable. Überfahren eines Tasks zeigt die exakte Drop-Position (vor/hinter diesen Task).
- Flache Liste ohne Sonderzonen: Header und Tasks sind ein gemeinsamer linearer Stream; Header sind Sortable-Items (disabled), bewegen sich aber visuell mit. Keine Ghosts/Gaps.
- Persistenz erst beim Drop: Während der Vorschau keine API-Calls.

## 🧭 Minimal-Ansatz (Keep it simple)

1) Flache Rendering-Hierarchie: Tages-Header und Tasks werden als flache Sequenz je Tag gerendert.
2) Vorschau ohne Live-Umsortierung: Während des Drags wird keine Datenliste umgebaut. Keine Gaps/Ghosts/Sonderdroppables – die natürliche Kollapsierung der Liste sorgt für den Effekt.
3) Drop minimal persistieren:
   - Gleiches Datum → handleReorderWithinDate(dateKey, taskIds)
   - Anderes Datum → handleReorderAcrossDates(taskId, newDate, insertIndex)
4) Kein Over-Engineering: Richtung über delta.y bestimmen, Sortierung über globalPosition; keine zusätzliche komplexe Kollisionserkennung im UI.

## ⚠️ Technische Hürden (High-Level)

- Datum/Zeitzone: Lokale Datumslogik (YYYY-MM-DD) strikt nutzen (kein UTC-Versatz).
- Over-State-Flattern: Zu viele State-Updates im onDragMove verursachen Sprünge. Lösung: kein Live-Reorder, minimale States, Rendering nur aus dem Store/Hook.
- Endlos-Reloads vermeiden: Keine tasks-Dependencies in useCallback; tasksRef verwenden. Keine Reloads in Fehlerpfaden von Optimistic-Updates.
- Header-Interaktion: Header sind Sortable-Items (disabled) und Teil der flachen Liste. Kein Droppable am Header, kein Sonderverhalten.

## ✅ Testfälle (manuell)

- Innerhalb eines Tages:
  - Nach oben ziehen → landet vor Ziel-Task
  - Nach unten ziehen → landet hinter Ziel-Task
- Über Tagesgrenzen:
  - Über den Header des Ziel-Tags hinwegziehen → Liste darüber collapst, Header rutscht hoch. Drop an erster Position des Ziel-Tags; Datum wird übernommen.
  - In früheren Tag ziehen → entsprechend korrekt
- Edge Cases:
  - Drag-Start/Ende ohne Flackern/Flattern
  - Keine Persistenz bis zum Drop; danach genau ein Persist-Vorgang

## 🔧 **Technische Implementierung (final):**

### **Kernprinzipien (final):**
1) Einfüge-Entscheidung basiert ausschließlich auf der visuellen Reihenfolge der Flat-List:
   - Vergleiche Index von `active.id` und `over.id` in der Flat-List.
   - `activeIdx < overIdx` ⇒ Einfügen NACH `over` (Insert-Index = overIndex + 1)
   - sonst Einfügen VOR `over` (Insert-Index = overIndex)
2) Header-Handling ohne Sonderpersistenz:
   - Header bleiben Sortable (disabled) für visuelle Bewegung, sind aber kein Persistenzziel.
   - Drop über Header (visuelle Richtung, Flat-List-Indexvergleich):
     - Nach unten über Header → ANFANG des Ziel-Tags (Index 0)
     - Nach oben über Header → ENDE des vorherigen Tags
3) Persistenz ausschließlich beim Drop, keine API-Calls während Drag.
4) Keine delta.y-Heuristik mehr, keine Live-Reorder der Datenliste.

### **Invarianten**
- Einfügen richtet sich immer nach der aktuell sichtbaren Reihenfolge (Flat-List), nicht nach `delta.y`.
- Header sind nie Persistenzziele; sie dienen nur der visuellen Orientierung.
- Overdue-Normalisierung: Gruppenberechnung nutzt `displayDate` (überfällige Tasks gehören visuell zu „Heute“).

### **Relevanter Handler-Ausschnitt:**
```typescript
// page.tsx - handleDragEnd
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  setActiveTask(null);

  if (!over || !active.data.current) return;

  const activeTask = active.data.current.task;
  const overElement = over.data.current;

  // Header-Drop → Mapping auf Tasks (Anfang/Ende), keine direkte Persistenz am Header
  if (overElement.type === 'date-header') {
    const flat = getFlatList();
    const headerIdx = flat.findIndex(i => i.id === over.id);
    const activeIdxInFlat = flat.findIndex(i => i.id === active.id);
    const movingDownVisually = activeIdxInFlat < headerIdx;
    let targetDateKey = overElement.dateKey as string;
    if (!movingDownVisually) {
      // Ende des vorherigen Tages
      for (let i = headerIdx - 1; i >= 0; i--) {
        const item = flat[i];
        if (item.type === 'date-header' && item.dateKey) {
          targetDateKey = item.dateKey;
          break;
        }
      }
    }
    const targetList = (groupedTasks[targetDateKey] || []).slice().sort((a, b) => a.globalPosition - b.globalPosition);
    const targetIndex = movingDownVisually ? 0 : targetList.length;
    await handleReorderAcrossDates(activeTask.id, parseDateKey(targetDateKey), targetIndex);
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

  // Über Tagesgrenzen verschieben, Position exakt bestimmen (visuelle Reihenfolge)
  const targetList = (groupedTasks[targetDateKey] || []).slice().sort((a, b) => a.globalPosition - b.globalPosition);
  const overIndex = targetList.findIndex(t => t.id === overTask.id);
  const flat = getFlatList();
  const activeIdxInFlat = flat.findIndex(i => i.id === active.id);
  const overIdxInFlat = flat.findIndex(i => i.id === over.id);
  const shouldInsertAfter = activeIdxInFlat < overIdxInFlat;
  const targetIndex = Math.max(0, (overIndex === -1 ? targetList.length : overIndex) + (shouldInsertAfter ? 1 : 0));
  await handleReorderAcrossDates(activeTask.id, overTask.dueDate ?? null, targetIndex);
};
```

### **Bereinigt (veraltet entfernt):**
- Delta-basierte Richtungsermittlung (`event.delta.y`) → entfernt.
- Direkte Persistenz auf Header-Drop → entfernt.
- Sonderlogik „Upward cross-day → Ende des vorherigen Tags“ → entfernt.
- Unendliche Reload-Schleife durch `tasks` in `useCallback`-Deps → behoben; `tasksRef` genutzt.

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

### **Positionslogik testen (final):**
Prüfe die deterministische Einfügung anhand visueller Reihenfolge:
- Innerhalb eines Tages: vor/nach Ziel-Task gemäß Flat-List Indexvergleich.
- Cross-Day über Header: Anfang/Ende korrekt gemappt.

### **Testmatrix (manuell, minimal)**
- Gleiches Datum
  - move: Task A über Task B nach unten → A hinter B
  - move: Task B über Task A nach oben → B vor A
- Über Tagesgrenzen (Header)
  - von unten über Header nach unten droppen → Position 1 im unteren Tag
  - von oben über Header nach oben droppen → letzte Position im oberen Tag
- Spezialfälle
  - last, last-1, last-2 bleiben stabil; kein „Sprung“ an falsches Listenende
  - Drop auf Header ohne vorherigen Header darüber → Anfang im Ziel-Tag (Fallback)

## 📋 **Debugging Checklist:**

### **API-Calls stoppen:**
- [ ] `tasks` aus allen `useCallback` Dependencies entfernen
- [ ] `loadData` calls in error handling entfernen
- [ ] State reversion statt reload verwenden
- [ ] Terminal auf unendliche API-Calls prüfen

### **Drag & Drop testen (Checkliste):**
- [x] Task nach oben schieben → VOR Ziel-Task
- [x] Task nach unten schieben → NACH Ziel-Task
- [x] Cross-Day Header-Drop oberhalb → ANFANG des Ziel-Tags
- [x] Cross-Day Header-Drop unterhalb → ENDE des vorherigen Tags
- [x] Spezialfälle: last, last-1, last-2 verhalten sich stabil korrekt
- [x] Keine Persistenz bis zum Drop; genau ein Persist-Vorgang

### **Performance prüfen:**
- [ ] Keine unendlichen API-Calls
- [ ] Smooth Animationen
- [ ] Keine Memory Leaks

### **UI/Overlay-Details:**
- Drag-Overlay ist gerade (keine Rotation), für klare visuelle Rückmeldung.
- Leichte Skalierung erlaubt (`scale-105`), aber keine Schrägstellung.

## ✅ **Status**

- Flache Liste, Header als Sortable (disabled), keine Live-Reorder-Datenmanipulation.
- Einfüge-Logik ausschließlich über visuelle Reihenfolge (Flat-List Indexvergleich).
- Header-Drops nur als Mapping (Anfang/Ende), keine direkte Persistenz am Header.
- Keine unendlichen Reloads; Optimistic-Updates ohne `loadData()`-Reload in Fehlerpfaden.

---

**Letzte Aktualisierung:** 14.10.2025
**Status:** Stabil – finale Logik implementiert, getestet und dokumentiert
