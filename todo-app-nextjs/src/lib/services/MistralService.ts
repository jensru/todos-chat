// src/lib/services/MistralService.ts - Professional Mistral AI Integration
export class MistralService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_MISTRAL_API_KEY || '';
  }

  async generateTaskSuggestions(userInput: string): Promise<string[]> {
    try {
      const response = await fetch('/api/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Schlage 3-5 konkrete Aufgaben vor für: ${userInput}`,
          context: { type: 'task_suggestions' }
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      // Parse the response as JSON array
      try {
        const suggestions = JSON.parse(data.response);
        return Array.isArray(suggestions) ? suggestions : [data.response];
      } catch {
        return [data.response];
      }
    } catch (error) {
      console.error('Mistral API Error:', error);
      return [];
    }
  }

  async generateTaskBreakdown(taskTitle: string): Promise<string[]> {
    try {
      const response = await fetch('/api/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Zerlege diese Aufgabe in Unteraufgaben: ${taskTitle}`,
          context: { type: 'task_breakdown' }
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      // Parse the response as JSON array
      try {
        const breakdown = JSON.parse(data.response);
        return Array.isArray(breakdown) ? breakdown : [data.response];
      } catch {
        return [data.response];
      }
    } catch (error) {
      console.error('Mistral API Error:', error);
      return [];
    }
  }

  async generateSmartResponse(userMessage: string, context: unknown): Promise<string> {
    try {
      const response = await fetch('/api/mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          return 'Rate Limit erreicht. Bitte warte einen Moment, bevor du eine weitere Anfrage stellst.';
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'Entschuldigung, ich konnte keine Antwort generieren.';
    } catch (error) {
      console.error('Mistral API Error:', error);
      if (error instanceof Error && error.message.includes('429')) {
        return 'Rate Limit erreicht. Bitte warte einen Moment, bevor du eine weitere Anfrage stellst.';
      }
      return 'Entschuldigung, es gab einen Fehler bei der KI-Antwort.';
    }
  }
}
