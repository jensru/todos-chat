# Überfällige Tasks Konzept

## 🎯 **Kernkonzept**

### **Grundidee:**
- **Keine separaten Datums-Gruppen** für vergangene Tage
- **Alle überfälligen Tasks** werden im "Heute"-Bereich angezeigt
- **Heute steht immer oben** in der Task-Liste
- **Tasks behalten ihre ursprüngliche Priorität und Position**

### **Verhalten:**
1. **Überfällige Tasks** (dueDate < heute) werden in der "Heute"-Gruppe angezeigt
2. **Original-Datum bleibt unverändert** in der Datenbank
3. **Überfällig-Label** wird angezeigt
4. **Bei Datums-Änderung** verschwindet das Überfällig-Label

---

## 🔧 **Technische Implementierung**

### **Task-Interface:**
```typescript
interface TaskWithOverdue extends Task {
  isOverdue: boolean;           // Wird dynamisch berechnet
  originalDueDate: string;      // YYYY-MM-DD für überfällige Tasks
  displayDate: string;          // "heute" für überfällige Tasks
  overdueSince?: Date;          // Wann wurde der Task überfällig
}
```

### **Grouping-Logik:**
```typescript
// Überfällige Tasks werden in "Heute"-Gruppe angezeigt
const grouped = tasks.reduce((acc, task) => {
  const groupKey = task.isOverdue ? today : task.originalDueDate;
  
  if (!acc[groupKey]) {
    acc[groupKey] = {
      date: groupKey,
      tasks: [],
      isOverdueGroup: task.isOverdue
    };
  }
  
  acc[groupKey].tasks.push(task);
  return acc;
}, {});
```

### **Drag & Drop Verhalten:**
- **Drag auf Zukunft:** Überfälliger Task wird "normal" (nicht mehr überfällig)
- **Drag auf Vergangenheit:** Normaler Task wird überfällig
- **Drag auf Heute:** Status bleibt unverändert
- **Drag innerhalb "Heute":** Status bleibt unverändert

### **Visual Indicators:**
- **Überfällig-Label:** "Überfällig seit [Datum]"
- **Rote Border:** Links-border für überfällige Tasks
- **Hintergrund-Farbe:** Leicht roter Hintergrund
- **Animation:** Bei Status-Änderungen

---

## 📊 **Vorteile unseres Konzepts**

### **UX-Verbesserungen:**
- ✅ **Bessere Übersicht** (alle wichtigen Tasks an einem Ort)
- ✅ **Reduzierte UI-Komplexität** (weniger Datums-Gruppen)
- ✅ **Klare Priorisierung** (überfällige Tasks sichtbar)
- ✅ **Einfachere Navigation** (Heute immer oben)

### **Technische Vorteile:**
- ✅ **Keine Datenbank-Änderungen** nötig
- ✅ **Backward-kompatibel** mit bestehender Architektur
- ✅ **Flexible Implementierung** (kann einfach angepasst werden)
- ✅ **Performance-optimiert** (weniger DOM-Elemente)

---

## 🎨 **UI/UX Design**

### **Task-Card Design:**
```
┌─────────────────────────────────────┐
│ [Drag Handle] Task Title            │
│                                     │
│ [🔴 Überfällig seit 12.10.2025]     │
│                                     │
│ [Checkbox] [Priority] [Actions]      │
└─────────────────────────────────────┘
```

### **Date-Header Design:**
```
┌─────────────────────────────────────┐
│ Heute (3 überfällig)                │
│ ─────────────────────────────────── │
│ [Task 1] [Task 2] [Task 3]          │
└─────────────────────────────────────┘
```

### **Status-Übergänge:**
- **Überfällig → Normal:** Grüne Animation
- **Normal → Überfällig:** Rote Animation
- **Drag & Drop:** Smooth Transition

---

## 🔄 **Workflow-Beispiele**

### **Beispiel 1: Überfälliger Task**
1. **Task erstellt** für gestern
2. **Heute:** Task erscheint in "Heute"-Gruppe mit "Überfällig"-Label
3. **User verschiebt** Task auf morgen
4. **Resultat:** Task wird "normal", Label verschwindet

### **Beispiel 2: Normaler Task**
1. **Task erstellt** für morgen
2. **User verschiebt** Task auf gestern
3. **Resultat:** Task wird überfällig, erscheint in "Heute"-Gruppe

### **Beispiel 3: Drag innerhalb "Heute"**
1. **Überfälliger Task** in "Heute"-Gruppe
2. **User verschiebt** Task innerhalb "Heute"
3. **Resultat:** Status bleibt überfällig, Position ändert sich

---

## 📈 **Analytics & Tracking**

### **Metriken:**
- **Overdue Task Count** (Anzahl überfälliger Tasks)
- **Overdue Task Actions** (Completed, Rescheduled, Deleted)
- **Average Overdue Days** (Durchschnittliche Überfälligkeit)
- **User Behavior** (Wie User mit überfälligen Tasks umgehen)

### **Tracking Events:**
```typescript
// Überfälliger Task wird erledigt
trackOverdueTaskAction(taskId, 'completed');

// Überfälliger Task wird verschoben
trackOverdueTaskAction(taskId, 'rescheduled');

// Überfälliger Task wird gelöscht
trackOverdueTaskAction(taskId, 'deleted');
```

---

## 🚀 **Implementierungsplan**

### **Phase 1: Backend-Logik**
- [ ] Task-Interface erweitern
- [ ] Overdue-Berechnung implementieren
- [ ] Grouping-Logik anpassen

### **Phase 2: UI-Komponenten**
- [ ] Task-Card erweitern
- [ ] Date-Header anpassen
- [ ] Overdue-Label implementieren

### **Phase 3: Drag & Drop**
- [ ] Smart Overdue Status Management
- [ ] Visual Feedback für Status-Änderungen
- [ ] Animation-System

### **Phase 4: Analytics**
- [ ] Overdue-Tracking implementieren
- [ ] Usage-Analytics erweitern
- [ ] Performance-Metriken

---

## 🔮 **Zukünftige Erweiterungen**

### **Mögliche Features:**
- **Overdue Notifications** (Push-Benachrichtigungen)
- **Overdue Categories** (1 Tag, 1 Woche, 1 Monat überfällig)
- **Auto-Reschedule** (Automatisches Verschieben)
- **Overdue Reports** (Wöchentliche/Monatliche Berichte)

### **Advanced Features:**
- **Smart Suggestions** (KI-basierte Vorschläge für überfällige Tasks)
- **Overdue Patterns** (Erkennung von Mustern)
- **Predictive Analytics** (Vorhersage von Überfälligkeit)

---

## 📝 **Fazit**

Unser Konzept bietet eine **elegante Lösung** für die Anzeige überfälliger Tasks:

- **Einfach zu verstehen** für User
- **Technisch sauber** implementierbar
- **Erweiterbar** für zukünftige Features
- **Performance-optimiert** für große Task-Listen

Das Konzept **reduziert die UI-Komplexität** und **verbessert die User Experience** durch klare Priorisierung und einfache Navigation.
