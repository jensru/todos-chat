/**
 * Hybrid Migration - Schrittweise Migration zur modularen Architektur
 * Kombiniert bestehende Funktionalität mit neuen Modulen
 */

class HybridMigration {
    constructor() {
        this.apiManager = new APIManager();
        this.taskService = new TaskService();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('🔄 Initialisiere Hybrid Migration...');
            
            // Lade Tasks mit der neuen API
            const tasks = await this.apiManager.getTasks();
            console.log(`✅ ${tasks.length} Tasks geladen`);
            
            // Setze globale Variablen für Kompatibilität
            window.allTasks = tasks;
            window.filteredTasks = tasks;
            
            // Initialisiere bestehende Funktionen
            this.initializeLegacyFunctions();
            
            this.isInitialized = true;
            console.log('✅ Hybrid Migration erfolgreich initialisiert');
            
        } catch (error) {
            console.error('❌ Hybrid Migration Fehler:', error);
            // Fallback: Verwende bestehende Funktionalität
            this.initializeFallback();
        }
    }

    initializeLegacyFunctions() {
        // Ersetze bestehende Funktionen mit neuen API-Calls
        window.loadTasks = async () => {
            try {
                const tasks = await this.apiManager.getTasks();
                window.allTasks = tasks;
                window.filteredTasks = tasks;
                return tasks;
            } catch (error) {
                console.error('Fehler beim Laden der Tasks:', error);
                return [];
            }
        };

        window.createTask = async (taskData) => {
            try {
                const result = await this.apiManager.createTask(taskData);
                // Lade Tasks neu
                await window.loadTasks();
                return result;
            } catch (error) {
                console.error('Fehler beim Erstellen des Tasks:', error);
                throw error;
            }
        };

        window.updateTask = async (taskId, updates) => {
            try {
                const result = await this.apiManager.updateTask(taskId, updates);
                // Lade Tasks neu
                await window.loadTasks();
                return result;
            } catch (error) {
                console.error('Fehler beim Aktualisieren des Tasks:', error);
                throw error;
            }
        };

        window.deleteTask = async (taskId) => {
            try {
                const result = await this.apiManager.deleteTask(taskId);
                // Lade Tasks neu
                await window.loadTasks();
                return result;
            } catch (error) {
                console.error('Fehler beim Löschen des Tasks:', error);
                throw error;
            }
        };

        window.toggleTaskStatus = async (taskId) => {
            try {
                const result = await this.apiManager.toggleTask(taskId);
                // Lade Tasks neu
                await window.loadTasks();
                return result;
            } catch (error) {
                console.error('Fehler beim Toggle des Tasks:', error);
                throw error;
            }
        };
    }

    initializeFallback() {
        console.log('⚠️ Verwende Fallback-Modus');
        // Hier könnten wir die ursprünglichen Funktionen wiederherstellen
    }

    // Utility-Methoden
    async refreshData() {
        try {
            const tasks = await this.apiManager.refreshData();
            window.allTasks = tasks;
            window.filteredTasks = tasks;
            return tasks;
        } catch (error) {
            console.error('Fehler beim Aktualisieren der Daten:', error);
            throw error;
        }
    }

    async searchTasks(query) {
        try {
            const results = await this.apiManager.searchTasks(query);
            window.filteredTasks = results;
            return results;
        } catch (error) {
            console.error('Fehler bei der Suche:', error);
            throw error;
        }
    }
}

// Export for use
window.HybridMigration = HybridMigration;

