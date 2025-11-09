// ==========================================
// 🎯 APPLICATION CONSTANTS
// ==========================================
import { config, isProduction } from './env';

export const CONSTANTS = {
  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: config.auth.tokenKey,
    USER: config.auth.userKey,
    THEME: 'admin-theme',
    LANGUAGE: 'admin-language'
  },
  
  // API Endpoints
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      VERIFY: '/auth/verify',
      REFRESH: '/auth/refresh'
    },
    ADMIN: {
      DASHBOARD: '/admin/dashboard/stats',
      BLOGS: '/admin/blogs',
      USERS: '/admin/users'
    }
  },
  
  // Feature Toggles
  FEATURES: {
    ANALYTICS: shouldEnableAnalytics(),
    DEBUG: shouldEnableDebug(),
    MAINTENANCE: isMaintenanceMode(),
    DEMO: isDemoMode()
  },
  
  // UI Constants
  UI: {
    THEME: config.ui.theme,
    LOCALE: config.ui.locale,
    TIMEZONE: config.ui.timezone,
    PAGINATION_LIMIT: config.performance.paginationLimit,
    DEBOUNCE_DELAY: config.performance.debounceDelay
  },
  
  // App Info
  APP_INFO: {
    NAME: config.app.title,
    VERSION: config.app.version,
    ENVIRONMENT: config.app.env,
    BUILD_TIMESTAMP: config.app.buildTimestamp
  }
};

// Export individual constants for easier imports
export const {
  STORAGE_KEYS,
  API_ENDPOINTS,
  FEATURES,
  UI,
  APP_INFO
} = CONSTANTS;

export default CONSTANTS;