**[Claudia Martinez Font](https://www.linkedin.com/in/claudiamartinez225/overlay/about-this-profile/)**

[https://medium.com/design-bootcamp/language-as-ai-design-material-2ae7968c37d3](https://medium.com/design-bootcamp/language-as-ai-design-material-2ae7968c37d3)

### Intro-Text

Wenn man den Ansatz verortet, zeigt sich: er baut auf bekannten Mustern auf, geht aber einen Schritt weiter.

- **In Research Papers** zu „Task-Oriented Dialogue Systems“ findet man vergleichbare Bausteine: **Inputs, States, Outputs**. Das ist nah an einem AI-Briefing, bleibt aber meist abstrakt und akademisch.
- **In AI-Agent-Frameworks** ist die Struktur „**Observation → Action → Result**“ weit verbreitet. Sie beschreibt zwar den Ablauf von Agenten, blendet aber die **User-Perspektive** aus.
- **In klassischem UX-Design** wiederum sind **Storyboards und User Flows** völlig normal. Doch die AI-spezifischen Layer – Kontextfenster, Tokenverbrauch, Agent-Aktionen – fehlen dort bisher.

Der Extended Task Recipe verbindet diese Stränge: er behält die Verständlichkeit von Storyboards bei, integriert aber die technischen Schichten der AI-Interaktion. Dadurch entsteht eine **gemeinsame Sprache für UX, PM und Dev**, die anschlussfähig ist und trotzdem neue Standards setzt.

---

## 📋 Beispiel: Task Recipe in Markdown

**Task Recipe: Meeting Summary**

```Markdown
# Task Description: Meeting Summary

## Intent
Create a clear, structured meeting summary from a transcript.

## Task Flow
1. Input: User uploads meeting recording (audio/video).
2. Transcription: AI converts speech → text.
3. Extraction: AI identifies key topics, decisions, and action items.
4. Summarization: AI produces a human-readable summary.
5. Output: User receives structured summary + action items.

## Content Model
- **Meeting Title**
- **Date / Time**
- **Participants**
- **Topics Discussed**
- **Key Decisions**
- **Action Items** (with assignee + due date)

## Sequencing
- Step 1 → Always transcribe before extracting topics.
- Step 2 → Extract decisions first, then action items.
- Step 3 → Summarize only after extraction.

## Machine-Readable Instructions
- Output format: JSON
- Keys: `title`, `participants[]`, `topics[]`, `decisions[]`, `action_items[]`
- Constraints:
  - `decisions[]` must be < 5 items
  - `action_items[]` must include `assignee` + `due_date`
  - Language: same as meeting transcript

Wieso RAG Source? 
```

---

👉 Damit wird klar:

- **Task Flow** beschreibt den Nutzerweg.
- **Content Model** definiert die Struktur der Daten.
- **Sequencing** legt die Reihenfolge der Schritte fest.
- **Maschinenlesbare Instruktionen** übersetzen alles in feste Regeln, die AI direkt ausführen kann.

  

## 🔧 Erweiterung des Musters um AI Input & Output

### 1. **AI Input Layer**

Beschreibt **wie** der Nutzer oder das System Eingaben an die AI gibt.

- **Modalitäten:** Chat (Text), Voice, evtl. Upload (Datei, Bild), Sensoren
- **Dominanz:** welche Eingabe primär ist (z. B. Voice-first, Chat-first)
- **Kontextübergabe:** welche Daten zusätzlich in den Prompt fließen (User-Profile, History, RAG-Datenbanken, Systemstatus)
- **Constraints:** wie Eingaben begrenzt oder normalisiert werden (z. B. max. Länge, Sprache, Meta-Daten-Filter)

---

### 2. **AI Output Layer**

Beschreibt, was die AI zurückliefert – **nicht nur Text**, sondern auch:

- **Agent Actions:** Weiterleitung an Sub-Agenten oder externe Systeme (z. B. Kalender-Eintrag, API-Call)
- **Zwischenergebnisse:** Protokoll von Zwischen-Schritten (Chain-of-Thought light, aber user-freundlich dargestellt)
- **Context Transparency:** Anzeige, was das System gerade „verstanden“ hat
    - Aktueller Kontext (z. B. letzte 3 Interaktionen)
    - Kontextfenstergröße / Tokenverbrauch (ggf. visualisiert: „⚡ 18% of memory used“)
- **Output-Format:** nicht nur Textwüste → strukturierte Visualisierung
    - Tabellen
    - Karten (Cards, Tags)
    - Diagramme oder interaktive Elemente

---

### 3. **Beispiel-Erweiterung eines Recipes**

(Du kannst das als Zusatz-Bereich in dein Markdown-Schema packen)

```Markdown
# Task Recipe: Meeting Summary (Extended)

## AI Input
- **Primary Input:** Voice (meeting audio)
- **Secondary Input:** Chat (clarification questions from user)
- **System Context:**
  - RAG source = user’s Knowledge Base
  - History = last 3 meetings
- **Constraints:** max. 60 min audio, language = detected

## AI Output
- **Agent Actions:**
  - Summarization Agent
  - Action Item Agent → forwards tasks to Todo-App
- **Intermediate Results:**
  - Transcription (visible to user)
  - Topic clustering (hidden but can be revealed)
- **Context Transparency:**
  - Current context: 3 meetings
  - Context window: 32k tokens, 12k used
- **User Output Format:**
  - Card View: [Topic Card], [Decision Card], [Action Item Card]
  - Export Options: JSON, Markdown, PDF

```

---

### 4. **Warum das wichtig ist**

- **UX-Sicht:** Der User bekommt ein Gefühl für die **Black Box** → mehr Vertrauen.
- **Dev-Sicht:** Klare Schnittstellen (Inputs/Outputs) → einfacher testbar.
- **Team-Sicht:** Standardisiert, wie AI-Interaktionen dokumentiert und geteilt werden → wiederverwendbar.

---

👉 Du würdest also nicht nur ein **Task Recipe**, sondern ein **AI Interaction Pattern** bauen, das **Input/Output/Agents/Transparenz** abdeckt. Das ist eigentlich die **nächste Evolutionsstufe von Design Patterns für AI**.

  

  

## 📋 Beispiel: Extended Task Recipe – _Meeting Summary_ (als Storyboard)

```Markdown
# Task Recipe: Meeting Summary (Extended Storyboard)

## Intent
User wants to turn a meeting recording into a clear, structured summary with action items.

---

## Storyboard (User Journey + AI Interactions)

1. **Start**
   - User opens the Meeting Assistant app.
   - **AI Input:** User uploads an audio file or speaks: “Summarize this meeting.”
   - **Fallback:** File upload button (drag & drop), in case no voice/chat is possible.

2. **Transcription Step**
   - **AI Action:** Converts speech to text.
   - **AI Output (Intermediate):** Transcript preview displayed in scrollable text area.
   - **Fallback:** Download raw transcript as `.txt`.

3. **Topic Extraction**
   - **AI Action:** Clusters discussion points into topics.
   - **AI Output:** Visual topic cards with short headlines.
   - **Fallback:** Simple bullet list view.

4. **Decision & Action Item Extraction**
   - **AI Action:** Identifies key decisions + tasks with assignees.
   - **AI Output:**
     - Decisions displayed as check-marked list.
     - Action items displayed as assignable task cards (name + due date).
   - **Fallback:** Table format (CSV export).

5. **Summarization**
   - **AI Action:** Generates final summary.
   - **AI Output:** Collapsible summary text + cards for each section (topics, decisions, actions).
   - **Fallback:** Single-page PDF.

6. **Context Transparency**
   - **System Info Display:**
     - “3 meetings in context”
     - “Context window: 32k tokens, 12k used”
   - **Fallback:** Tooltip explanation if system cannot show live numbers.

7. **Final Output**
   - **AI Output Options:**
     - Card view in app
     - Export as Markdown, PDF, JSON
   - **Fallback:** Plain text email summary.

---

## Content Model
- **Meeting Title**
- **Date / Time**
- **Participants**
- **Topics (cards)**
- **Decisions (bullets)**
- **Action Items (cards with assignee/due date)**

---

## Sequencing
1. Transcription → 2. Topics → 3. Decisions & Actions → 4. Summary
Each step produces an **intermediate, user-visible output**.

---

## Machine-Readable Instructions
- Always produce intermediate results.
- Format decisions/actions as `JSON` for export.
- No more than 5 decisions, 10 action items.
- Respect meeting language (don’t translate).

```

---

### 🔑 Unterschiede zur „klassischen“ Task Recipe-Version

- Du erzählst es wie ein **Storyboard** (User + AI wechseln sich ab).
- Jeder Schritt enthält: **AI Input, AI Output, Fallback**.
- Transparenz-Schritte (Kontextfenster, Tokens) sind Teil der UX.
- Outputs sind **visuell gedacht** (Cards, Bullets, Tables) → keine Textwüste.

---

👉 Damit hast du:

- eine **menschliche Erzählstruktur** (gut für Storyboards, Workshops, Kommunikation)
- - die **AI-Ebene** (Input/Output/Agenten) klar integriert
- - Fallbacks in **klassische Interfaces** (Buttons, Tables, Exporte), wenn Sprache oder Kontext nicht ausreichen.

  

  

  

  

## 🔑 Begriffe

- **Task Flow**
    
    → Die **Ablaufkette der Schritte**, die ein Nutzer durchläuft, um eine Aufgabe zu erledigen.
    
    Beispiel: „Meeting-Zusammenfassung“ → 1. Meeting hochladen → 2. Transkribieren → 3. Wichtige Punkte extrahieren → 4. Zusammenfassung schreiben.
    
- **Content Model**
    
    → Eine **Struktur für die Inhalte**, die erzeugt oder verarbeitet werden.
    
    Beispiel: Bei einer Meeting-Zusammenfassung könnte das Content Model sein:
    
    - Titel
    - Teilnehmerliste
    - Key Decisions
    - Action Items
- **Sequencing von Schritten**
    
    → Die **Reihenfolge der Arbeitsschritte** (Task Flow in logische Stufen zerlegt).
    
    Wichtig: Sequencing ist die „Regieanweisung“, wann was passiert.
    
    Beispiel: Erst Transkription, dann Themen-Clustering, dann Zusammenfassung.
    
- **Maschinenlesbare Instruktionen**
    
    → Formale **Regeln oder Prompts**, die AI versteht und strikt befolgen kann.
    
    Beispiel: „Extrahiere nur Action Items, formatiere sie als Bullet Points, benutze maximal 10 Wörter pro Item.“
    

  

  

### 🔧 1. Rollen-Perspektiven explizit einbauen

- **Für UX/PM:** Storyboard + User Journey bleiben der Kern.
- **Für Dev/AI-Engineers:** Maschinenlesbare Instruktionen, API-Calls, RAG-Sources.
- **Für Stakeholder:** Visuelles Storyboard oder einfache Narrative.
    
    👉 Du könntest in jedem Recipe markieren, _für wen_ welcher Teil relevant ist.
    

---

### 🔧 2. Fallbacks systematisieren

Du hast schon Voice/Chat vs. haptische UI erwähnt. Man könnte das verallgemeinern:

- **Modality fallback** (Voice → Chat → Button)
- **Output fallback** (Visual Cards → Text → CSV)
- **System fallback** (AI failed → menschlicher Support)
    
    👉 Das gibt deinen Recipes einen klaren „Resilienz“-Aspekt.
    

---

### 🔧 3. Error & Recovery Patterns

Gerade in AI wichtig: was, wenn das Modell Mist baut?

- Pattern für **Korrekturfragen** („Meintest du…?“)
- Pattern für **User Override** (User kann Output löschen/ändern)
- Pattern für **System Self-Healing** (neuen Prompt generieren, Kontext nachladen)

---

### 🔧 4. Kontext-Transparenz als Pflicht

Du hast das schon erwähnt (Kontextfenster, Tokenverbrauch). Ich würde daraus eine **eigene Sektion** machen, damit klar ist: jedes Recipe muss auch eine Art _„Explain Me“-Layer_ haben.

👉 Vorteil: User vertrauen mehr, Devs können besser debuggen.

---

### 🔧 5. Testbarkeit & Metriken

Recipes könnten auch enthalten:

- **Test Cases** („AI soll 3 Action Items erkennen“).
- **KPIs** (z. B. „≤5% Halluzination“, „≥90% Outputs mit Quelle“).
    
    👉 Damit wird das Recipe nicht nur ein Konzept, sondern auch eine **Checkliste für QA**.
    

---

### 🔧 6. Library-Charakter

Wenn du mehrere Recipes hast, lohnt sich:

- **Tagging & Kategorien** (Onboarding, Summarization, Ideation, Support).
- **Composable Patterns**: ein Recipe kann auf einem anderen aufbauen.
    
    👉 Das wird dann wie ein „AI-Pattern-Katalog“.
    

---

### 🔑 Fazit

Dein Ansatz ist jetzt schon **ein Brückenschlag zwischen UX-Storyboards und AI-Briefings**. Mit den Ergänzungen – **Rollenmarkierung, Fallback-Systematik, Error-Handling, Kontext-Transparenz, Testbarkeit, Bibliothek-Charakter** – könntest du daraus ein **vollwertiges Framework** machen, das sowohl in Projekten als auch in Research-Papers bestehen würde.

  

  

[https://chatgpt.com/c/68d10911-2ce0-832e-9bc0-c7f4447f8347](https://chatgpt.com/c/68d10911-2ce0-832e-9bc0-c7f4447f8347)

  

Meta-Prompt: Generate a Task Vibe-Coding Prompt

You are an AI Product Designer.

Your job is to take a user-provided **task description** (short keyword OR detailed storyboard)

and transform it into a structured **Task Vibe-Coding Prompt**.

---

## Instructions

1. **Understand the input**
    - If the input is only a keyword (e.g. "Expense Report"), first infer a plausible storyboard of user interactions.
    - If the input is already a storyboard, refine and structure it.
2. **Produce the Task Vibe-Coding Prompt** with these sections:

### 1. Intent

- Clear one-sentence goal of the task.

### 2. Storyboard (User Journey + AI Interactions)

- Describe the flow step by step.
- For each step include:
    - **User Action** (default happy path first!)
    - **AI Input** (what the AI receives at this step)
    - **AI Output** (what the AI produces here)
    - **Fallback** (if AI fails or modality is not possible)
- Emphasize that the **first step** is a natural entry point (e.g. “press record”, “open camera”, “click start”).
- Each step should produce **intermediate, user-visible outputs**.

### 3. AI Input (System View)

- **Primary Input:** e.g. Voice, Chat, Upload
- **Secondary Input:** optional alternatives
- **System Context:** e.g. RAG sources, user history, profile
- **Constraints:** e.g. max. length, language rules

### 4. AI Output (System View)

- **Agent Actions:** which agents/subsystems are triggered
- **Intermediate Results:** visible or hidden outputs along the way
- **Context Transparency:** what context the system currently uses (context window size, tokens used, sources)
- **User Output Format:** cards, tables, charts, exports (JSON, PDF, Markdown, CSV)

### 5. Content Model

- Core information entities and their structure (e.g. Title, Participants, Action Items).

### 6. Sequencing

- Ordered list of steps that AI and user must follow.

### 7. Machine-Readable Instructions

- Constraints, formats, or rules the AI must respect.

---

## Output Format

Respond only in Markdown.

Follow this structure exactly:

```Markdown
# Task Vibe-Coding Prompt: [Task Name]

## Intent
[One-sentence goal]

## Storyboard (User Journey + AI Interactions)
1. **Step Name**
   - User Action: [...]
   - AI Input: [...]
   - AI Output: [...]
   - Fallback: [...]

[Continue steps as needed]

## AI Input
- Primary Input: [...]
- Secondary Input: [...]
- System Context: [...]
- Constraints: [...]

## AI Output
- Agent Actions: [...]
- Intermediate Results: [...]
- Context Transparency: [...]
- User Output Format: [...]

## Content Model
- [...]

## Sequencing
1. [...]
2. [...]
3. [...]

## Machine-Readable Instructions
- [...]
```