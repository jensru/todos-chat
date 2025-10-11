// src/lib/i18n/translations.ts - All UI Translations
export const translations = {
  en: {
    // Empty States
    emptyState: {
      loading: {
        title: 'Loading tasks...',
        description: 'Your tasks are being loaded.'
      },
      noTasks: {
        title: 'No tasks',
        description: 'Your tasks & goals will appear here. Start by chatting!'
      }
    },
    
    // Buttons
    buttons: {
      newTask: 'New Task',
      newGoal: 'New Goal',
      logout: 'Logout'
    },
    
    // Chat
    chat: {
      welcomeMessage: 'Hey, what do you want to work on today? I can help you create, filter and manage tasks!',
      placeholder: 'Type your message...',
      send: 'Send',
      clear: 'Clear Chat'
    },
    
    // Task States
    taskStates: {
      active: 'active',
      highPriority: 'High Priority',
      completed: 'completed',
      completionRate: 'completion rate'
    },
    
    // Error Messages
    errors: {
      failedToLoad: 'Failed to load tasks',
      failedToCreate: 'Failed to create task',
      failedToUpdate: 'Failed to update task',
      failedToDelete: 'Failed to delete task',
      unauthorized: 'Unauthorized',
      rateLimit: 'Rate limit exceeded. Please wait a moment before making another request.',
      aiError: 'Sorry, there was an error with the AI response.'
    },
    
    // Date Formatting
    dates: {
      today: 'Today',
      tomorrow: 'Tomorrow',
      withoutDate: 'Without date'
    }
  },
  
  de: {
    // Empty States
    emptyState: {
      loading: {
        title: 'Lade Aufgaben...',
        description: 'Deine Aufgaben werden geladen.'
      },
      noTasks: {
        title: 'Keine Aufgaben',
        description: 'Deine Aufgaben & Ziele erscheinen hier. Fang einfach im Chat an!'
      }
    },
    
    // Buttons
    buttons: {
      newTask: 'Neue Aufgabe',
      newGoal: 'Neues Ziel',
      logout: 'Abmelden'
    },
    
    // Chat
    chat: {
      welcomeMessage: 'Hey, woran willst du heute arbeiten? Ich kann dir helfen, Aufgaben zu erstellen, zu filtern und zu verwalten!',
      placeholder: 'Gib deine Nachricht ein...',
      send: 'Senden',
      clear: 'Chat löschen'
    },
    
    // Task States
    taskStates: {
      active: 'aktiv',
      highPriority: 'Hohe Priorität',
      completed: 'erledigt',
      completionRate: 'Erledigungsrate'
    },
    
    // Error Messages
    errors: {
      failedToLoad: 'Fehler beim Laden der Aufgaben',
      failedToCreate: 'Fehler beim Erstellen der Aufgabe',
      failedToUpdate: 'Fehler beim Aktualisieren der Aufgabe',
      failedToDelete: 'Fehler beim Löschen der Aufgabe',
      unauthorized: 'Nicht autorisiert',
      rateLimit: 'Rate Limit erreicht. Bitte warte einen Moment, bevor du eine weitere Anfrage stellst.',
      aiError: 'Entschuldigung, es gab einen Fehler bei der KI-Antwort.'
    },
    
    // Date Formatting
    dates: {
      today: 'Heute',
      tomorrow: 'Morgen',
      withoutDate: 'Ohne Datum'
    }
  },
  
  fr: {
    // Empty States
    emptyState: {
      loading: {
        title: 'Chargement des tâches...',
        description: 'Vos tâches sont en cours de chargement.'
      },
      noTasks: {
        title: 'Aucune tâche',
        description: 'Vos tâches et objectifs apparaîtront ici. Commencez par discuter!'
      }
    },
    
    // Buttons
    buttons: {
      newTask: 'Nouvelle Tâche',
      newGoal: 'Nouvel Objectif',
      logout: 'Déconnexion'
    },
    
    // Chat
    chat: {
      welcomeMessage: 'Salut, sur quoi veux-tu travailler aujourd\'hui? Je peux t\'aider à créer, filtrer et gérer des tâches!',
      placeholder: 'Tapez votre message...',
      send: 'Envoyer',
      clear: 'Effacer le Chat'
    },
    
    // Task States
    taskStates: {
      active: 'actif',
      highPriority: 'Haute Priorité',
      completed: 'terminé',
      completionRate: 'taux de réalisation'
    },
    
    // Error Messages
    errors: {
      failedToLoad: 'Échec du chargement des tâches',
      failedToCreate: 'Échec de la création de la tâche',
      failedToUpdate: 'Échec de la mise à jour de la tâche',
      failedToDelete: 'Échec de la suppression de la tâche',
      unauthorized: 'Non autorisé',
      rateLimit: 'Limite de taux dépassée. Veuillez attendre un moment avant de faire une autre demande.',
      aiError: 'Désolé, il y a eu une erreur avec la réponse IA.'
    },
    
    // Date Formatting
    dates: {
      today: 'Aujourd\'hui',
      tomorrow: 'Demain',
      withoutDate: 'Sans date'
    }
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
