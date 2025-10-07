/**
 * DOM Utilities - Hilfsfunktionen für DOM-Manipulation
 */

class DomUtils {
    // Element selection
    static $(selector) {
        return document.querySelector(selector);
    }

    static $$(selector) {
        return document.querySelectorAll(selector);
    }

    static find(element, selector) {
        return element.querySelector(selector);
    }

    static findAll(element, selector) {
        return element.querySelectorAll(selector);
    }

    // Element creation
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    static createElementWithHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    // Element manipulation
    static addClass(element, className) {
        if (element) element.classList.add(className);
    }

    static removeClass(element, className) {
        if (element) element.classList.remove(className);
    }

    static toggleClass(element, className) {
        if (element) element.classList.toggle(className);
    }

    static hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    }

    static setAttribute(element, name, value) {
        if (element) element.setAttribute(name, value);
    }

    static getAttribute(element, name) {
        return element ? element.getAttribute(name) : null;
    }

    static removeAttribute(element, name) {
        if (element) element.removeAttribute(name);
    }

    // Content manipulation
    static setText(element, text) {
        if (element) element.textContent = text;
    }

    static setHTML(element, html) {
        if (element) element.innerHTML = html;
    }

    static getText(element) {
        return element ? element.textContent : '';
    }

    static getHTML(element) {
        return element ? element.innerHTML : '';
    }

    // Visibility
    static show(element) {
        if (element) element.style.display = '';
    }

    static hide(element) {
        if (element) element.style.display = 'none';
    }

    static toggle(element) {
        if (element) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
    }

    static isVisible(element) {
        return element ? element.style.display !== 'none' : false;
    }

    // Event handling
    static on(element, event, handler) {
        if (element) element.addEventListener(event, handler);
    }

    static off(element, event, handler) {
        if (element) element.removeEventListener(event, handler);
    }

    static once(element, event, handler) {
        if (element) {
            const onceHandler = (e) => {
                handler(e);
                element.removeEventListener(event, onceHandler);
            };
            element.addEventListener(event, onceHandler);
        }
    }

    // Animation
    static fadeIn(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        element.style.opacity = '0';
        element.style.display = '';
        
        return new Promise(resolve => {
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    static fadeOut(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        return new Promise(resolve => {
            const start = performance.now();
            const startOpacity = parseFloat(getComputedStyle(element).opacity);
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = startOpacity * (1 - progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    // Scrolling
    static scrollTo(element, behavior = 'smooth') {
        if (element) {
            element.scrollIntoView({ behavior });
        }
    }

    static scrollToTop(element, behavior = 'smooth') {
        if (element) {
            element.scrollTo({ top: 0, behavior });
        }
    }

    static scrollToBottom(element, behavior = 'smooth') {
        if (element) {
            element.scrollTo({ top: element.scrollHeight, behavior });
        }
    }

    // Form utilities
    static getFormData(form) {
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    static setFormData(form, data) {
        if (!form) return;
        
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        });
    }

    static clearForm(form) {
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    }

    // Validation
    static validateForm(form, rules) {
        if (!form) return { valid: false, errors: [] };
        
        const errors = [];
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const fieldRules = rules[input.name];
            
            if (fieldRules) {
                if (fieldRules.required && !value) {
                    errors.push(`${fieldRules.label || input.name} ist erforderlich`);
                }
                
                if (fieldRules.minLength && value.length < fieldRules.minLength) {
                    errors.push(`${fieldRules.label || input.name} muss mindestens ${fieldRules.minLength} Zeichen haben`);
                }
                
                if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                    errors.push(`${fieldRules.label || input.name} darf maximal ${fieldRules.maxLength} Zeichen haben`);
                }
                
                if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                    errors.push(`${fieldRules.label || input.name} hat ein ungültiges Format`);
                }
            }
        });
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Utility functions
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static unescapeHTML(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    }
}

// Export for use in other modules
window.DomUtils = DomUtils;
