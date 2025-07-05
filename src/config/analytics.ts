// Configuración centralizada para Google Analytics
export const ANALYTICS_CONFIG = {
  // Google Analytics Measurement ID
  GOOGLE_ANALYTICS_ID: 'G-4N4QVEB03T',
  
  // Configuración adicional para GA4
  GA4_CONFIG: {
    // Habilitar debug mode en desarrollo
    debug_mode: process.env.NODE_ENV === 'development',
    
    // Configuración de privacidad
    anonymize_ip: true,
    
    // Configuración de cookies
    cookie_flags: 'SameSite=None;Secure',
  },
  
  // Eventos personalizados para tu aplicación
  EVENTS: {
    // Eventos de publicación
    PUBLICATION_VIEW: 'publication_view',
    PUBLICATION_CREATE: 'publication_create',
    PUBLICATION_EDIT: 'publication_edit',
    PUBLICATION_DELETE: 'publication_delete',
    
    // Eventos de búsqueda
    SEARCH_PERFORMED: 'search_performed',
    SEARCH_FILTER_APPLIED: 'search_filter_applied',
    
    // Eventos de usuario
    USER_LOGIN: 'user_login',
    USER_REGISTER: 'user_register',
    USER_LOGOUT: 'user_logout',
    
    // Eventos de engagement
    CONTACT_SENT: 'contact_sent',
    FAVORITE_ADDED: 'favorite_added',
    FAVORITE_REMOVED: 'favorite_removed',
    
    // Eventos de navegación
    CATEGORY_VIEW: 'category_view',
    LOCATION_SELECTED: 'location_selected',
  },
  
  // Categorías de eventos
  CATEGORIES: {
    ENGAGEMENT: 'engagement',
    PUBLICATION: 'publication',
    USER: 'user',
    SEARCH: 'search',
    NAVIGATION: 'navigation',
  },
} as const; 