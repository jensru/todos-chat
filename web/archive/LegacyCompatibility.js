/**
 * Legacy Compatibility Layer
 * Stellt Kompatibilität mit bestehenden onclick-Handlern sicher
 */

class LegacyCompatibility {
    constructor(uiComponent) {
        this.uiComponent = uiComponent;
        this.initializeLegacyFunctions();
    }

    initializeLegacyFunctions() {
        // Legacy-Funktionen für bestehende onclick-Handler
        window.openCategoryManagementModal = () => {
            console.log('Category management modal - Legacy function');
            // TODO: Implementieren mit UIComponent
        };
        
        window.clearSearch = () => {
            const searchInput = document.querySelector('[data-search]');
            if (searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
            }
        };
        
        window.filterTasks = (filter) => {
            console.log('Legacy filterTasks:', filter);
            // TODO: Implementieren mit UIComponent
        };
        
        window.setSorting = (sort) => {
            console.log('Legacy setSorting:', sort);
            // TODO: Implementieren mit UIComponent
        };
        
        window.toggleCompletedTasks = () => {
            console.log('Legacy toggleCompletedTasks');
            // TODO: Implementieren mit UIComponent
        };
        
        window.selectAllTasks = () => {
            console.log('Legacy selectAllTasks');
            // TODO: Implementieren mit UIComponent
        };
        
        window.deselectAllTasks = () => {
            console.log('Legacy deselectAllTasks');
            // TODO: Implementieren mit UIComponent
        };
        
        window.bulkChangeCategory = () => {
            console.log('Legacy bulkChangeCategory');
            // TODO: Implementieren mit UIComponent
        };
        
        window.bulkChangePriority = () => {
            console.log('Legacy bulkChangePriority');
            // TODO: Implementieren mit UIComponent
        };
        
        window.bulkChangeStatus = () => {
            console.log('Legacy bulkChangeStatus');
            // TODO: Implementieren mit UIComponent
        };
        
        window.bulkDeleteTasks = () => {
            console.log('Legacy bulkDeleteTasks');
            // TODO: Implementieren mit UIComponent
        };
        
        window.handleChatKeyPress = (event) => {
            if (event.key === 'Enter') {
                this.sendMistralMessage();
            }
        };
        
        window.sendMistralMessage = () => {
            const chatInput = document.getElementById('chatInput');
            const message = chatInput.value.trim();
            
            if (!message) return;
            
            // TODO: Implementieren mit TaskService
            console.log('Legacy sendMistralMessage:', message);
            chatInput.value = '';
        };
    }
}

// Export for use in other modules
window.LegacyCompatibility = LegacyCompatibility;

