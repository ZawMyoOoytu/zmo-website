// admin-panel/src/utils/env.js
// ==========================================
// 🛠️ ENVIRONMENT CONFIGURATION UTILITIES - CRA VERSION
// ==========================================

/**
 * Safely access environment variables with fallback
 * CRA uses process.env, not import.meta.env
 */
export const getEnv = (key, defaultValue = '') => {
  // For Create React App, use process.env
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
};

/**
 * Get environment variable as number
 */
export const getEnvNumber = (key, defaultValue = 0) => {
  const value = getEnv(key);
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Get environment variable as boolean
 */
export const getEnvBoolean = (key, defaultValue = false) => {
  const value = getEnv(key);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
};

// ==========================================
// 🚀 APPLICATION CONFIGURATION - CRA VERSION
// ==========================================
export const config = {
  // API Configuration
  api: {
    baseURL: getEnv('REACT_APP_API_BASE_URL', 'https://zmo-backend.onrender.com/api'),
    timeout: getEnvNumber('REACT_APP_API_TIMEOUT', 15000),
    retryAttempts: getEnvNumber('REACT_APP_API_RETRY_ATTEMPTS', 3),
  },
  
  // App Configuration
  app: {
    env: getEnv('REACT_APP_ENV', 'production'),
    version: getEnv('REACT_APP_VERSION', '2.0.0'),
    title: getEnv('REACT_APP_ADMIN_TITLE', 'ZMO Admin Dashboard'),
    baseURL: getEnv('REACT_APP_ADMIN_URL', 'https://zmo-admin.vercel.app'),
  },
  
  // Feature Flags
  features: {
    analytics: getEnvBoolean('REACT_APP_ANALYTICS_ENABLED', true),
    debug: getEnvBoolean('REACT_APP_DEBUG_MODE', false),
    maintenance: getEnvBoolean('REACT_APP_MAINTENANCE_MODE', false),
    demo: getEnvBoolean('REACT_APP_DEMO_MODE', false),
  },
  
  // Authentication & Security
  auth: {
    tokenRefreshInterval: getEnvNumber('REACT_APP_TOKEN_REFRESH_INTERVAL', 5400000),
    sessionTimeout: getEnvNumber('REACT_APP_SESSION_TIMEOUT', 3600000),
    autoLogout: getEnvBoolean('REACT_APP_AUTO_LOGOUT_ENABLED', true),
    tokenKey: getEnv('REACT_APP_TOKEN_KEY', 'adminToken'),
    userKey: getEnv('REACT_APP_USER_KEY', 'adminUser')
  },
  
  // URLs & Domains
  urls: {
    admin: getEnv('REACT_APP_ADMIN_URL', 'https://zmo-admin.vercel.app'),
    frontend: getEnv('REACT_APP_FRONTEND_URL', 'https://zmo-frontend.vercel.app'),
    website: getEnv('REACT_APP_WEBSITE_URL', 'https://zmo-website.vercel.app'),
    mainDomain: getEnv('REACT_APP_MAIN_DOMAIN', 'https://zmo.com'),
  }
};

// ==========================================
// 🌍 ENVIRONMENT CHECKS
// ==========================================
export const isProduction = config.app.env === 'production';
export const isDevelopment = config.app.env === 'development';

// Auto-log configuration in development
if (isDevelopment) {
  console.log('🌍 Environment Configuration:', config);
}

export default config;