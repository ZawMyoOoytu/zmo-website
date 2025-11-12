/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'test'
  readonly VITE_APP_VERSION: string
  readonly VITE_ADMIN_TITLE: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_ANALYTICS_ENABLED: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_ADMIN_URL: string
  readonly VITE_MAIN_DOMAIN: string
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_TOKEN_REFRESH_INTERVAL: string
  readonly VITE_SESSION_TIMEOUT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}