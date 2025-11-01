# 🧠 Chat-Day-Memory Konzept für die To-Do-App (Chat-First)

## 🎯 Ziel des Systems

Die App arbeitet mit einem **Chat-First-Prinzip**:  
Neue Aufgaben, Änderungen, Verschiebungen oder Batch-Actions passieren über Chat oder Voice.  
Die UI liefert nur minimale Interaktionen (abhaken, Drag & Drop, Datum kurz verändern).

Damit der **Agent über Tage hinweg intelligenter wird**, aber nicht in unkontrollierbares Gedächtnis-Chaos fällt, bekommt er **pro Tag genau einen gültigen Kontext (Memory)**. Dieser Kontext wird täglich beim Start des Chats geladen und am Ende des Tages neu erzeugt.

---

## 🌀 Memory-Prinzip

- **Ein Chat = Ein Tag.**  
- Nach Tagesende wird der Chat **resettet**, aber der Agent erhält eine **komprimierte Zusammenfassung des Tages**.  
- Diese Zusammenfassung wird beim nächsten Tag wieder als System-Prompt geladen.
- Zusätzlich enthält der Kontext **Kurzzeit- und Langzeit-Muster**, aber in sehr reduziertem Umfang (max. 1–2 Absätze).

---

## ✅ Struktur des Memory-Kontexts (für den nächsten Tag)

Der Tageskontext für den Agenten (unsichtbar für den Nutzer) könnte z. B. so gegliedert sein:

### 1. **Gestern / Letzter Chat**
Informationen über den vorherigen Tag:
- Anzahl neu erstellter Tasks  
- Erledigte Tasks  
- Verschobene oder gelöschte Tasks  
- Wichtige Themen/Fokus (z. B. „Steuerunterlagen“, „Projekt X“, „Familienorganisation“)  
- Optional: Auffällige wiederholte Aufgaben („Aufgabe X zum dritten Mal verschoben“)  

### 2. **Kurzzeit-Muster (letzte 3–7 Tage)**
Verdichtete Erkenntnisse, z. B.:
- Wann arbeitet die Person produktiv? (morgens, abends?)  
- Häufig verschobene Kategorien oder Aufgabentypen  
- Tägliche Prioritäten (z. B. meist beruflich vs. privat)  
- Typisches Verhalten („private Tasks eher abends“, „viele spontane Aufgaben am späten Abend“)

### 3. **Langzeit-Kontext (Wochen/Monat – max. 1 Absatz)**
Ein kleiner Absatz mit Dingen, die länger gültig sind:
- Aktuelle Lebens-/Projektphase („arbeitet gerade an Projekt X und Familienkram“)
- Grobe Motivations- oder Arbeitsmuster („startet viele Dinge, Abschluss schwierig“)  
- Wiederholende Themen über mehrere Wochen hinweg  

---

## 💡 Welche Ereignisse sollten ins Memory?

| Ereignis / Verhalten                    | Speichern? | Warum? |
|-----------------------------------------|------------|--------|
| Neuer Task erstellt                     | ✅          | Erkennung von Interessen/Themen |
| Task erledigt                           | ✅          | Fortschritt, Prioritäten |
| Task verschoben (wann & wohin?)         | ✅          | Muster & Aufschieberitis |
| Task gelöscht                           | ⭕ optional | Nur wichtig bei Wiederholung oder bestimmter Kategorie |
| Kategorie/Label zugewiesen              | ✅          | Clusterbildung von Themen |
| Sprach-/Batch-Befehle („verschiebe alles von…“) | ✅ | Erkenntnisse über Nutzungsmuster |
| Zeitpunkte (z. B. morgens produktiv)    | ✅          | Für Agent-Antworten/Subtile Vorschläge |
| Frust, Blockade, mentale Notizen im Chat | optional | Nur wenn deutlich & hilfreich (nicht psychologisch analysierend) |

---

## 🗂 Format-Idee (Beispiel im JSON/Markdown-Mix)

*(Nur als Denkstruktur – keine technische Vorgabe)*

```markdown
## Memory für 2025-11-02

### Gestern (2025-11-01)
- 7 neue Tasks, 5 erledigt, 2 auf heute verschoben
- Fokus auf Projekt „Steuer & Buchhaltung“
- 2 Tasks erneut verschoben („Fitness kündigen“, „Eltern anrufen“)

### Kurzzeit-Muster (letzte 5 Tage)
- Produktiv 09–11 Uhr, private Aufgaben eher nach 20 Uhr
- Finanz-/Papierkram wird oft verschoben
- Meiste neuen Tasks entstehen spontan am Abend

### Langzeit-Kontext (letzte Wochen / max. 1 Absatz)
Der Nutzer jongliert Projektarbeit mit Familienorganisation. Er startet viele Aufgaben schnell, Abschluss fällt schwer. Hohe Motivation morgens, abends eher Ideen & Brain Dumps. Fokus aktuell stark beruflich, private Themen bleiben liegen.
🗨️ Sichtbarkeit für den Nutzer
Diese Memory-Struktur sieht der User nicht.

Der Agent nutzt sie nur implizit, z. B. durch:

leichte Erinnerungen („Wollen wir mit den Steuer-Dingen weitermachen?“)

sinnvolle Nachfragen („Willst du die verschobenen Aufgaben neu gruppieren?“)

aber ohne psychologische Analyse oder „Creepy Insights“.

🚫 Wichtig: Was es NICHT ist
Keine vollständige Historie aller Chats.

Kein Endlos-Memory mit Vektordatenbank.

Keine moralische/psychologische Bewertung („du bist unorganisiert“).

Keine automatische Veränderung von Tasks ohne Nutzerzustimmung.

📍 Nächster Schritt
Optional zu definieren:

Wo und wie wird diese Tageszusammenfassung gespeichert?

Wann genau wird sie erzeugt? (Manuell? Automatisch bei Tagesende/Nutzerbefehl?)

JSON- oder Markdown-Format für API-Prompting?

Systemprompt-Struktur in Cursor.

Fertig – läuft. Bei Bedarf kann ich daraus direkt ein System-Prompt-Template oder eine Cursor-README.md bauen.

yaml
Copy code

### 🧩 Zusatz für ChatGPT-5 Verhalten im Cursor

**Agent-Verhalten:**
- Arbeitet immer nur mit dem aktuellen Memory-Kontext.
- Macht Vorschläge, führt aber keine Änderungen ohne Bestätigung aus.
- Fragt einmal nach, wenn ein Befehl mehrdeutig ist – aber keine langen Rückfragen.
- Nutzt Muster aus dem Memory subtil, nicht sichtbar („Willst du mit den gestern verschobenen Aufgaben starten?“ statt „du hast Prokrastination“).

**Wann Memory erzeugt wird:**
- Manuell: Wenn der Nutzer den Tag aktiv beendet.
- Automatisch: Beim nächsten Tagesstart / neuem Chat.
- Nur Zusammenfassung speichern, nie den kompletten Chatlog.

**Was der Agent vermeiden soll:**
- Keine psychologischen Urteile oder Bewertungen.
- Keine unerlaubten Task-Änderungen ohne Rückfrage.
- Keine lange Historie laden – nur den einen offiziellen Memory-Block nutzen.
