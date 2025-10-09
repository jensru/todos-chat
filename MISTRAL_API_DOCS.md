# Mistral AI Function Calling Dokumentation

## Übersicht
Mistral AI unterstützt Function Calling (Tools) für die Integration externer Funktionen in Chat-Completions. Dies ermöglicht es dem Modell, strukturierte Daten zu generieren und externe APIs aufzurufen.

## API-Struktur

### Request Format
```json
{
  "model": "mistral-large-latest",
  "messages": [
    {
      "role": "system",
      "content": "Du bist ein hilfreicher Assistent..."
    },
    {
      "role": "user", 
      "content": "Erstelle eine Aufgabe für morgen"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "create_task",
        "description": "Erstellt eine neue Aufgabe",
        "parameters": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "description": "Titel der Aufgabe"
            },
            "dueDate": {
              "type": "string",
              "description": "Fälligkeitsdatum"
            }
          },
          "required": ["title"]
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
        "content": "Ich erstelle eine Aufgabe für dich.",
        "tool_calls": [
          {
            "id": "call_123",
            "type": "function",
            "function": {
              "name": "create_task",
              "arguments": "{\"title\": \"Steuererklärung machen\", \"dueDate\": \"2024-01-15\"}"
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

## Best Practices

1. **Klare Beschreibungen**: Tools sollten präzise Beschreibungen haben
2. **Parameter-Definitionen**: Alle Parameter müssen korrekt definiert sein
3. **Required Fields**: Nur wirklich notwendige Parameter als required markieren
4. **Error Handling**: Robuste Fehlerbehandlung für Tool-Aufrufe
5. **Token Limits**: Tools erhöhen Token-Verbrauch

## Implementierung für Todo-App

### Verfügbare Tools:
1. `create_task` - Neue Aufgabe erstellen
2. `filter_tasks` - Aufgaben filtern
3. `delete_tasks` - Aufgaben löschen
4. `update_task_priority` - Priorität ändern
5. `sort_tasks` - Aufgaben sortieren
6. `create_category` - Kategorie erstellen

### Tool Execution Flow:
1. User sendet Nachricht
2. Mistral entscheidet, ob Tools benötigt werden
3. Tool Calls werden in Response zurückgegeben
4. Frontend führt Tool Calls aus
5. Ergebnisse werden an User zurückgegeben

## Rate Limits
- Standard: 100 Requests/Minute
- Mit Tools: Reduzierte Limits aufgrund höherer Token-Nutzung
- 429 Status Code bei Überschreitung

## Fehlerbehandlung
- Tool Call Parsing Errors
- API Rate Limit Errors  
- Network Timeouts
- Invalid Tool Arguments
