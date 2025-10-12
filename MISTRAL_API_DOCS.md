# Mistral AI Function Calling Dokumentation

## Übersicht
Mistral AI unterstützt Function Calling (Tools) für die Integration externer Funktionen in Chat-Completions. Dies ermöglicht es dem Modell, strukturierte Daten zu generieren und externe APIs aufzurufen. In unserer Todo-App wird Mistral für intelligente Task-Manipulation verwendet.

## API-Struktur

### Request Format
```json
{
  "model": "mistral-large-latest",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful AI assistant for task management.\nTODAY'S DATE: 2024-10-12 (YYYY-MM-DD format)\nUse this as reference for 'today', 'tomorrow', 'yesterday' calculations.\n\nSMART TASK DETECTION:\n- If user says something like 'Brief schreiben an Peter' or 'Call mom tomorrow' or 'Buy groceries' → AUTOMATICALLY create a task\n- If user says 'Verschiebe Task X nach morgen' or 'Move task Y to tomorrow' → Use update_task directly\n- If user says 'Lösche Task Z' or 'Delete task W' → Use delete_task directly\n- If user asks 'What are my tasks?' or 'Show me my tasks' → Use list_tasks tool\n\nIMPORTANT: For task operations, use these parameters:\n- taskDate: 'today', 'tomorrow', 'yesterday'\n- taskPosition: 'first', 'last', 'only task from today'\n- taskTitle: partial match like 'Brief' for 'Brief schreiben an Peter'\n- dueDate: Use ISO format YYYY-MM-DD (e.g., '2024-10-12' for today)\n\nALWAYS use the appropriate tool directly - no need to list tasks first."
    },
    {
      "role": "user", 
      "content": "Verschiebe den einzigen Todo von heute auf morgen"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "update_task",
        "description": "Updates an existing task. Use this for: 'Verschiebe Task nach morgen', 'Markiere als erledigt', 'Ändere Priorität'. Identify by taskDate, taskPosition, or taskTitle.",
        "parameters": {
          "type": "object",
          "properties": {
            "taskTitle": {
              "type": "string",
              "description": "Title of the task to update (use partial match, e.g., 'Brief' for 'Brief schreiben an Peter')"
            },
            "taskPosition": {
              "type": "string",
              "description": "Position of the task (e.g., 'first', 'last', 'only task from today')"
            },
            "taskDate": {
              "type": "string",
              "description": "Date of the task (e.g., 'today', 'tomorrow', '2024-01-01')"
            },
            "taskId": {
              "type": "string",
              "description": "ID der zu aktualisierenden Aufgabe (if known)"
            },
            "title": {
              "type": "string",
              "description": "Neuer Titel (optional)"
            },
            "description": {
              "type": "string",
              "description": "Neue Beschreibung (optional)"
            },
            "notes": {
              "type": "string",
              "description": "Neue Notizen (optional)"
            },
            "dueDate": {
              "type": "string",
              "description": "Neues Fälligkeitsdatum (optional)"
            },
            "category": {
              "type": "string",
              "description": "Neue Kategorie (optional)"
            },
            "priority": {
              "type": "boolean",
              "description": "Neue Priorität (optional)"
            },
            "completed": {
              "type": "boolean",
              "description": "Erledigt-Status (optional)"
            }
          },
          "required": ["taskId"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}
```

### Response Format
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "mistral-large-latest",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Ich verstehe! Ich führe deine Anfrage aus...",
        "tool_calls": [
          {
            "id": "call_123",
            "type": "function",
            "function": {
              "name": "update_task",
              "arguments": "{\"taskDate\": \"today\", \"dueDate\": \"2024-10-13\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ],
  "usage": {
    "prompt_tokens": 82,
    "completion_tokens": 18,
    "total_tokens": 100
  }
}
```

## Tool Choice Optionen

- `"auto"` - Modell entscheidet selbst, ob Tools verwendet werden
- `"none"` - Keine Tools verwenden
- `{"type": "function", "function": {"name": "tool_name"}}` - Spezifisches Tool erzwingen

## Verfügbare Tools

### 1. create_task
**Beschreibung:** Erstellt eine neue Aufgabe
**Parameter:**
- `title` (required) - Titel der Aufgabe
- `description` (optional) - Beschreibung
- `dueDate` (optional) - Fälligkeitsdatum (YYYY-MM-DD oder "today"/"tomorrow")
- `priority` (optional) - Priorität (boolean)
- `category` (optional) - Kategorie
- `notes` (optional) - Notizen

**Beispiel:**
```json
{
  "title": "Brief schreiben an Peter",
  "dueDate": "tomorrow",
  "priority": true
}
```

### 2. update_task
**Beschreibung:** Aktualisiert eine bestehende Aufgabe
**Parameter:**
- `taskId` (required) - ID der Aufgabe
- `taskTitle` (optional) - Titel zur Identifikation (partial match)
- `taskDate` (optional) - Datum zur Identifikation ("today", "tomorrow")
- `taskPosition` (optional) - Position zur Identifikation ("first", "last", "only task from today")
- `title`, `description`, `notes`, `dueDate`, `category`, `priority`, `completed` (optional) - Update-Felder

**Beispiel:**
```json
{
  "taskDate": "today",
  "dueDate": "tomorrow"
}
```

### 3. delete_task
**Beschreibung:** Löscht eine Aufgabe
**Parameter:**
- `taskTitle` (required) - Titel der zu löschenden Aufgabe
- `taskId` (optional) - ID der Aufgabe (falls bekannt)

**Beispiel:**
```json
{
  "taskTitle": "Brief schreiben"
}
```

### 4. list_tasks
**Beschreibung:** Zeigt alle aktuellen Aufgaben an
**Parameter:** Keine

**Beispiel:**
```json
{}
```

## Server-Side Tool Execution

### Sicherheit
- **Authentifizierung:** Alle Tool Calls werden server-side mit Supabase Auth ausgeführt
- **User Isolation:** Row Level Security (RLS) stellt sicher, dass User nur ihre eigenen Tasks sehen
- **Input Validation:** Robuste Parameter-Validierung und Fehlerbehandlung

### Execution Flow
```typescript
1. User sends message to Mistral
2. Mistral detects intent and calls appropriate tool
3. Server-side tool execution with Supabase auth
4. Database update with proper user filtering
5. UI refresh with needsRefresh flag
6. Visual feedback to user
```

### Date Handling
- **Today Context:** Mistral receives current date in system prompt
- **Robust Parsing:** Handles "today", "tomorrow", YYYY-MM-DD formats
- **Timezone Safe:** Consistent date formatting across all functions

## Natural Language Processing

### Smart Task Detection
Mistral kann automatisch Tasks aus natürlicher Sprache erkennen:

**Task Creation:**
- "Brief schreiben an Peter" → create_task
- "Call mom tomorrow" → create_task
- "Buy groceries" → create_task

**Task Manipulation:**
- "Verschiebe Task nach morgen" → update_task
- "Markiere als erledigt" → update_task
- "Lösche Task X" → delete_task
- "Was sind meine Tasks?" → list_tasks

### Multi-Language Support
- **Automatic Detection:** Mistral detects user's language from message
- **Response Language:** Mistral responds in the same language
- **Supported Languages:** German, English, French, Spanish, Italian, Portuguese, Dutch, Russian, Chinese, Japanese, Korean, Arabic, Hindi, and more

## Best Practices

### Tool Design
1. **Klare Beschreibungen:** Tools sollten präzise Beschreibungen haben
2. **Parameter-Definitionen:** Alle Parameter müssen korrekt definiert sein
3. **Required Fields:** Nur wirklich notwendige Parameter als required markieren
4. **Flexible Identification:** Multiple ways to identify tasks (title, date, position)

### Error Handling
1. **Robuste Fehlerbehandlung:** Für Tool-Aufrufe und API-Calls
2. **User-Friendly Messages:** Verständliche Fehlermeldungen
3. **Graceful Degradation:** Fallback-Verhalten bei Fehlern
4. **Logging:** Comprehensive logging for debugging

### Performance
1. **Token Limits:** Tools erhöhen Token-Verbrauch
2. **Rate Limits:** 100 Requests/Minute (Standard)
3. **Caching:** Appropriate caching strategies
4. **Optimization:** Efficient tool execution

## Rate Limits & Quotas

- **Standard:** 100 Requests/Minute
- **With Tools:** Reduzierte Limits aufgrund höherer Token-Nutzung
- **429 Status Code:** Bei Überschreitung
- **Error Handling:** Graceful degradation bei Rate Limits

## Fehlerbehandlung

### Common Errors
- **Tool Call Parsing Errors:** Invalid JSON in tool arguments
- **API Rate Limit Errors:** 429 status code handling
- **Network Timeouts:** Connection issues
- **Invalid Tool Arguments:** Parameter validation failures
- **Authentication Errors:** Unauthorized access attempts

### Error Response Format
```json
{
  "error": "Failed to generate response",
  "details": "Specific error message"
}
```

## Implementation Details

### Files
- `src/app/api/mistral/route.ts` - Main API endpoint
- `src/lib/services/MistralToolsService.ts` - Tool definitions
- `src/hooks/useMistralChat.ts` - Chat integration

### Key Functions
- `executeToolCallServerSide()` - Server-side tool execution
- `handleCreateTaskServerSide()` - Task creation
- `handleUpdateTaskServerSide()` - Task updates
- `handleDeleteTaskServerSide()` - Task deletion
- `handleListTasksServerSide()` - Task listing

---

**Entwickelt für moderne Task-Management mit KI-Unterstützung**

*Mistral AI Function Calling Documentation - Version 6.0.0*