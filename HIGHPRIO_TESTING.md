# 🚀 Highprio-Tasks: Test-Anleitung (Live Demo)

## ✅ Was wurde implementiert

### Phase 1: Sortierung ✅
- `src/hooks/useTaskManagement.ts`: Sortier-Logik mit Priorität
- Highprio-Tasks erscheinen oben im Datum

### Phase 2: Drag-Drop ✅  
- `src/app/page.tsx`: 3 Sortierungen korrigiert
  - Header-Drop bei previousDateKey
  - Task-zu-Task Drop bei targetList
  - Gleiches Datum (innerhalb Gruppe)
- `src/lib/services/ApiTaskService.ts`: Kommentiert (Frontend schickt bereits sortiert)

### Phase 3: UI-Highlighting ✅
- `src/components/TaskCardRefactored.tsx`: Gelber Left-Border + leicht gelber Background

---

## 🧪 Live-Test auf localhost:3000

### Server läuft auf:
**http://localhost:3000**

---

## 📋 Test-Szenarien (SCHRITT-FÜR-SCHRITT)

### **Test 1: Highprio-Task erkennung**

1. Öffne http://localhost:3000
2. **Erstelle 3 neue Tasks** im heutigen Tag:
   ```
   Task 1: "Einkaufen"
   Task 2: "Bericht schreiben"
   Task 3: "Anruf tätigen"
   ```

3. **Markiere Task 2 als Highprio**:
   - Klicke auf den ⭐ Stern neben "Bericht schreiben"
   - Der Stern sollte **GELB** werden (gefüllt)
   - Task sollte **sofort nach oben springen**! 🚀

**Erwartetes Ergebnis:**
```
Heute (3 Tasks)
━━━━━━━━━━━━━━━━
⭐ Bericht schreiben          ← GELBER Left-Border, gelber Hintergrund
   [Highprio, oben!]

📋 Einkaufen
📋 Anruf tätigen
```

**✅ BESTANDEN:** Task springt nach oben + visuelles Highlighting sichtbar

---

### **Test 2: Highprio Toggle funktioniert**

1. Klicke auf den ⭐ Stern von "Bericht schreiben" nochmal
   - Stern sollte **grau werden** (nicht mehr gefüllt)
   - Task sollte **nach unten springen** 📉

**Erwartetes Ergebnis:**
```
Heute (3 Tasks)
━━━━━━━━━━━━━━━━
📋 Einkaufen
⭐ Bericht schreiben          ← Kein Highlighting mehr
📋 Anruf tätigen
```

**✅ BESTANDEN:** Toggle funktioniert bidirektional

---

### **Test 3: Drag-Drop mit Highprio (Gleiches Datum)**

1. Markiere "Anruf tätigen" als Highprio
   - Sollte nach oben springen

**Jetzt:**
```
Heute (3 Tasks)
━━━━━━━━━━━━━━━━
⭐ Anruf tätigen        ← Highprio 1
⭐ Bericht schreiben    ← Highprio 2
📋 Einkaufen            ← Normal
```

2. **Ziehe "Einkaufen" über "Bericht schreiben"** (nach oben)
   - Task sollte zwischen den Highprios platziert werden
   - ODER: Respektiere Prioritäts-Grenze?

**Erwartete Szenarien:**
```
SZENARIO A (Grenze wird respektiert):
⭐ Anruf tätigen
⭐ Bericht schreiben
📋 Einkaufen    ← Bleibt unter Highprios!

SZENARIO B (Freie Reordnung):
⭐ Anruf tätigen
📋 Einkaufen    ← Wird zwischen Highprios platziert
⭐ Bericht schreiben
```

**❓ ERWARTUNG:** Szenario A (Grenzen werden respektiert)
**✅ / ⚠️ BESTANDEN:** Je nach Implementierung

---

### **Test 4: Refresh-Persistenz (KRITISCHER TEST!)**

1. Status vor Refresh:
```
Heute (3 Tasks)
⭐ Anruf tätigen
⭐ Bericht schreiben
📋 Einkaufen
```

2. **Drücke F5 oder Cmd+R (Page Refresh)**

3. **Nach Refresh:**
   - ✅ Highprio-Tasks sollten IMMER NOCH oben sein
   - ✅ Reihenfolge sollte gleich sein
   - ✅ Visuelles Highlighting erhalten
   - ❌ NICHT: Alle Tasks durcheinander

**Erwartetes Ergebnis:**
```
Gleich wie vorher:
⭐ Anruf tätigen        ← Gelber Border, gelber Hintergrund
⭐ Bericht schreiben    ← Gelber Border, gelber Hintergrund
📋 Einkaufen
```

**✅ BESTANDEN:** Persistenz über Refresh gewährleistet

---

### **Test 5: Cross-Date Drag-Drop**

1. Erstelle Task für **morgen**:
   ```
   Task 4: "Email beantworten"
   ```

2. Markiere Task 4 als Highprio

3. **Ziehe Task 4 zu heute** (über ein Task von heute)

**Erwartetes Verhalten:**
- Task 4 sollte zu "Heute" wechseln
- Task 4 sollte **immer noch Highprio sein** ⭐
- Task 4 sollte oben bei den anderen Highprio-Tasks erscheinen

**Erwartetes Ergebnis:**
```
Heute (4 Tasks)
⭐ Anruf tätigen
⭐ Bericht schreiben
⭐ Email beantworten    ← Neu, aber Highprio + oben!
📋 Einkaufen

Morgen (0 Tasks)
(Leer)
```

**✅ BESTANDEN:** Priorität bleibt über Datum-Grenzen erhalten

---

### **Test 6: Neue Task mit Highprio erstellen**

1. Öffne den Plus-Button zum Erstelle neue Task
2. Erstelle Task mit Highprio von Anfang an:
   ```
   Title: "Dringend: Client Meeting"
   Priority: ✓ (aktiviert)
   Date: Heute
   ```

3. **Erscheint Task oben mit ⭐ und gelbem Border?**

**✅ BESTANDEN:** Neue Highprio-Tasks werden korrekt platziert

---

## 🔍 Debug-Tipps

### Browser Console Öffnen
- **Chrome/Firefox:** F12 → Console Tab
- Schaue nach Error-Meldungen

### Was sollte man sehen:
```javascript
// In der Console sollte kein Error sein:
✅ Keine roten Fehler
✅ Normale Logs sollten sauber sein
```

### Performance prüfen:
- Die Sortierung sollte **SOFORT** erfolgen
- Drag-Drop sollte **flüssig** sein
- Keine Verzögerungen oder Lag

---

## 📊 Behebung von Problemen

### Problem: Tasks springt nicht oben
**Lösung:**
1. Seite refreshen (F5)
2. Stars neu klicken
3. Browser DevTools → Console auf Fehler prüfen

### Problem: Drag-Drop funktioniert nicht korrekt
**Lösung:**
1. Stelle sicher, dass die Sortierung korrekt ist (Test 1-2)
2. Versuche Tasks im **gleichen Datum** zu ziehen (nicht cross-date)
3. Wenn immer noch Probleme: Console-Fehler notieren

### Problem: Nach Refresh ist Priorität weg
**Lösung:**
1. Das wäre ein DB-Fehler
2. Öffne Browser DevTools → Network Tab
3. Prüfe den GET /api/tasks Response
4. Schau, ob `priority: true/false` in den Task-Objekten ist

---

## ✅ Final Checklist

Alle diese sollten **✅ GRÜN** sein:

- [ ] **Sortierung:** Highprio-Tasks oben
- [ ] **Toggle:** Priority-Stern toggle funktioniert
- [ ] **Drag-Drop:** Ziehen funktioniert (gleiches Datum)
- [ ] **Refresh:** Reihenfolge bleibt erhalten
- [ ] **Cross-Date:** Highprio über Datum hinweg
- [ ] **UI:** Gelber Border sichtbar
- [ ] **Performance:** Keine Verzögerungen
- [ ] **Console:** Keine Fehler

---

## 🎯 Was wurde NICHT implementiert (Optional)

- [ ] **Prioritäts-Grenzen enforcement** (Highprio kann über Normal gezogen werden - optional)
- [ ] **Mistral Integration** (kann noch kommen)
- [ ] **Sub-Header** (PRIORITÄT / NORMAL - optional)

Diese können später hinzugefügt werden, wenn nötig.

---

## 📝 Nächste Schritte (nach lokalem Test)

1. ✅ Alle Tests bestanden?
   - → **Merge auf main**

2. ⚠️ Einige Tests fehlgeschlagen?
   - → **Bug-Fix in branch**
   - → **Re-Test**
   - → **Dann merge**

3. 🔥 Alles perfekt?
   - → **Erstelle PR**
   - → **Code Review**
   - → **Deploy zu production**

---

## 💬 Feedback

Wenn etwas nicht funktioniert:

1. Notiere **exakt, was nicht funktioniert**
2. Zeige **Screenshots** oder **Video**
3. Öffne **Browser Console** (F12)
4. Kopiere **Error-Messages** von dort
5. Beschreibe die **Schritte zum Reproduzieren**

---

**Version:** 1.0  
**Datum:** 20.10.2025  
**Status:** 🚀 Live auf localhost:3000





