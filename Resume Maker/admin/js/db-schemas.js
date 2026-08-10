/**
 * Database Schemas & Validation Middleware (Mock Full-Stack Backend)
 * 
 * In a true Node/Express/MongoDB environment, these would be Mongoose Schemas.
 * Since ResuAI operates purely in the client-side for now, this script acts as a 
 * strict validation layer (middleware) before writing any data to localStorage.
 */

const Schemas = {
    /**
     * User Schema
     * @typedef {Object} User
     * @property {string} id - Unique UUID
     * @property {string} name - Full Name
     * @property {string} email - Valid Email Address
     * @property {string} passwordHash - Obfuscated/Hashed Password
     * @property {string} role - 'user' | 'admin'
     * @property {string} status - 'Active' | 'Banned' | 'Suspended'
     * @property {number} resumesCreated - Analytics counter
     * @property {string} date - ISO Date string of registration
     */
    validateUser: function(userData) {
        if (!userData.email || !userData.email.includes('@')) {
            throw new Error("Validation Error: Invalid email format in User Schema.");
        }
        if (!['user', 'admin'].includes(userData.role || 'user')) {
            throw new Error("Validation Error: Invalid role in User Schema.");
        }
        return {
            id: userData.id || crypto.randomUUID(),
            name: userData.name || "Unknown User",
            email: userData.email,
            passwordHash: userData.passwordHash || "",
            role: userData.role || 'user',
            status: userData.status || 'Active',
            resumesCreated: userData.resumesCreated || 0,
            date: userData.date || new Date().toISOString()
        };
    },

    /**
     * Template Schema
     * @typedef {Object} Template
     * @property {string} id - Unique template slug
     * @property {string} title - Display title
     * @property {string} category - e.g., 'Modern', 'Professional'
     * @property {boolean} isActive - Toggle visibility
     */
    validateTemplate: function(templateData) {
        if (!templateData.id || !templateData.title) {
            throw new Error("Validation Error: Template Schema requires id and title.");
        }
        return {
            id: templateData.id,
            title: templateData.title,
            category: templateData.category || 'Standard',
            isActive: typeof templateData.isActive === 'boolean' ? templateData.isActive : true
        };
    },

    /**
     * Analytics Schema
     * @typedef {Object} AnalyticsEvent
     * @property {string} eventType - e.g., 'resume_export', 'user_signup'
     * @property {string} userId - Reference to User
     * @property {string} timestamp - ISO Date
     */
    validateEvent: function(eventData) {
        return {
            eventType: eventData.eventType || 'unknown_event',
            userId: eventData.userId || 'anonymous',
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Configuration Schema (for AI Prompts, API Keys, Ads.txt)
     * @typedef {Object} SystemConfig
     * @property {string} configKey
     * @property {string} configValue
     * @property {string} lastUpdated
     */
    validateConfig: function(configData) {
        if (!configData.configKey) {
            throw new Error("Validation Error: Configuration requires a configKey.");
        }
        return {
            configKey: configData.configKey,
            configValue: configData.configValue || '',
            lastUpdated: new Date().toISOString()
        };
    }
};

/**
 * Mock DB Middleware
 * Wraps localStorage to enforce schemas before writing
 */
const MockDB = {
    saveUser: function(userData) {
        const validUser = Schemas.validateUser(userData);
        const users = JSON.parse(localStorage.getItem('resuai_users') || '[]');
        users.push(validUser);
        localStorage.setItem('resuai_users', JSON.stringify(users));
        return validUser;
    },
    saveEvent: function(eventData) {
        const validEvent = Schemas.validateEvent(eventData);
        const events = JSON.parse(localStorage.getItem('resuai_analytics_events') || '[]');
        events.push(validEvent);
        localStorage.setItem('resuai_analytics_events', JSON.stringify(events));
        return validEvent;
    },
    saveConfig: function(configData) {
        const validConfig = Schemas.validateConfig(configData);
        const configs = JSON.parse(localStorage.getItem('resuai_system_configs') || '{}');
        configs[validConfig.configKey] = validConfig;
        localStorage.setItem('resuai_system_configs', JSON.stringify(configs));
        return validConfig;
    }
};

// Export to window for global access in our mock architecture
window.MockDB = MockDB;
window.Schemas = Schemas;
