# Mistral AI API Dokumentation

## Übersicht
Die Mistral AI API bietet verschiedene Modelle für Chat-Completions mit unterschiedlichen Fähigkeiten.

## Verfügbare Modelle

### mistral-small
- **Tool-Calls:** ❌ Nicht unterstützt
- **Verwendung:** Einfache Chat-Completions
- **Kosten:** Günstiger
- **Limitation:** `tool_calls: null` bei Tool-Requests

### mistral-large-latest
- **Tool-Calls:** ✅ Vollständig unterstützt
- **Verwendung:** Erweiterte Chat-Completions mit Tools
- **Kosten:** Höher
- **Features:** Function Calling, Tool Use

## API-Endpoint
```
POST https://api.mistral.ai/v1/chat/completions
```

## Headers
```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## Request Format

### Basis Chat-Completion
```json
{
  "model": "mistral-small",
  "messages": [
    {
      "role": "user",
      "content": "Hallo, wie geht es dir?"
    }
  ],
  "max_tokens": 200,
  "temperature": 0.1
}
```

### Mit Tool-Calls (nur mistral-large-latest)
```json
{
  "model": "mistral-large-latest",
  "messages": [
    {
      "role": "system",
      "content": "Du bist ein Tool-Server für Task-Management."
    },
    {
      "role": "user",
      "content": "Erstelle einen neuen Todo: Test Task"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "create_task",
        "description": "Erstelle einen neuen Task",
        "parameters": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "description": "Titel des Tasks"
            },
            "category": {
              "type": "string",
              "description": "Kategorie des Tasks"
            }
          },
          "required": ["title", "category"]
        }
      }
    }
  ],
  "tool_choice": "auto",
  "max_tokens": 200,
  "temperature": 0.1
}
```

## Response Format

### Normale Response
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "mistral-small",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hallo! Mir geht es gut, danke der Nachfrage."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}
```

### Tool-Call Response (mistral-large-latest)
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
        "tool_calls": [
          {
            "id": "call_123",
            "type": "function",
            "function": {
              "name": "create_task",
              "arguments": "{\"title\": \"Test Task\", \"category\": \"General\"}"
            }
          }
        ],
        "content": ""
      },
      "finish_reason": "tool_calls"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 8,
    "total_tokens": 23
  }
}
```

## Tool-Choice Optionen

### "auto" (Empfohlen)
```json
"tool_choice": "auto"
```
- Mistral entscheidet selbst, ob Tools verwendet werden
- Funktioniert nur mit mistral-large-latest

### "required"
```json
"tool_choice": "required"
```
- Mistral MUSS ein Tool verwenden
- Kann zu Fehlern führen, wenn kein passendes Tool verfügbar

### Spezifisches Tool
```json
"tool_choice": {
  "type": "function",
  "function": {
    "name": "create_task"
  }
}
```
- Zwingt Mistral, ein bestimmtes Tool zu verwenden

## Fehlerbehandlung

### Rate Limits
```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_exceeded",
    "code": 429
  }
}
```

### Ungültiger API-Key
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "code": 401
  }
}
```

### Modell nicht verfügbar
```json
{
  "error": {
    "message": "Model not found",
    "type": "invalid_request_error",
    "code": 404
  }
}
```

## Best Practices

### 1. Modell-Auswahl
- **Für einfache Chats:** `mistral-small`
- **Für Tool-Calls:** `mistral-large-latest`
- **Für Produktion:** Immer das richtige Modell verwenden

### 2. System-Prompts
```json
{
  "role": "system",
  "content": "Du bist ein Tool-Server für Task-Management. Du MUSST die verfügbaren Tools verwenden. NIEMALS Shell-Commands oder Dateisystem-Operationen vorschlagen."
}
```

**Dynamisches Datum im System-Prompt:**
```javascript
const today = new Date();
const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
const todayFormatted = today.toLocaleDateString('de-DE', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

const systemPrompt = `Du bist ein Tool-Server für Task-Management. Du MUSST die verfügbaren Tools verwenden. Heute ist ${todayFormatted} (${todayString}). Verwende immer das korrekte Datum (${todayString}) für heute.`;
```

### 3. Tool-Definitionen
- **Klare Beschreibungen:** Was macht das Tool?
- **Vollständige Parameter:** Alle nötigen Felder definieren
- **Validierung:** Required-Felder explizit angeben

### 4. Error Handling
```javascript
try {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mistral API Error: ${error.error?.message || response.status}`);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('Mistral API Fehler:', error);
  throw error;
}
```

## Kosten

### mistral-small
- **Input:** ~$0.25 pro 1M Tokens
- **Output:** ~$0.25 pro 1M Tokens

### mistral-large-latest
- **Input:** ~$2.00 pro 1M Tokens
- **Output:** ~$6.00 pro 1M Tokens

## Limitationen

### mistral-small
- ❌ Keine Tool-Calls
- ❌ Begrenzte Kontext-Länge
- ✅ Günstig
- ✅ Schnell

### mistral-large-latest
- ✅ Tool-Calls unterstützt
- ✅ Größerer Kontext
- ❌ Teurer
- ❌ Langsamer

## Implementierungsbeispiel

### Node.js mit Tool-Calls
```javascript
async function callMistralWithTools(prompt, tools) {
  const apiKey = process.env.MISTRAL_API_KEY;
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein Tool-Server für Task-Management.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      tools: tools,
      tool_choice: 'auto',
      max_tokens: 200,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`Mistral API Error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.choices[0].message.tool_calls) {
    // Tool-Calls ausführen
    return await executeToolCalls(data.choices[0].message.tool_calls);
  } else {
    // Normale Antwort
    return data.choices[0].message.content;
  }
}
```

## Troubleshooting

### Problem: Tool-Calls funktionieren nicht
**Lösung:** Verwende `mistral-large-latest` statt `mistral-small`

### Problem: Rate Limits
**Lösung:** Implementiere Retry-Logic mit Exponential Backoff

### Problem: Ungültige Tool-Parameter
**Lösung:** Validiere Tool-Definitionen und Parameter-Schema

### Problem: Hohe Kosten
**Lösung:** Verwende `mistral-small` für einfache Tasks, `mistral-large-latest` nur für Tool-Calls

---

*Erstellt am: 7. Oktober 2025*
*Basierend auf: Offizielle Mistral API-Dokumentation und praktischen Tests*
