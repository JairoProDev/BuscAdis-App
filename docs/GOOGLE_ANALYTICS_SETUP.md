# Configuración de Google Analytics en BuscAdis

Esta guía te mostrará cómo está configurado Google Analytics en el proyecto y cómo usar las herramientas de tracking disponibles.

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Componentes Creados](#componentes-creados)
3. [Hook de Google Analytics](#hook-de-google-analytics)
4. [Eventos Personalizados](#eventos-personalizados)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Configuración de Privacidad](#configuración-de-privacidad)
7. [Debugging](#debugging)

## 🚀 Configuración Inicial

### 1. Google Analytics Measurement ID

El ID de medición configurado es: `G-4N4QVEB03T`

### 2. Archivos de Configuración

- **`src/config/analytics.ts`**: Configuración centralizada
- **`src/components/analytics/GoogleAnalytics.tsx`**: Componente principal
- **`src/components/analytics/PageViewTracker.tsx`**: Tracking automático de páginas
- **`src/hooks/useGoogleAnalytics.ts`**: Hook personalizado

### 3. Integración en Layout

El tracking se inicializa automáticamente en `src/app/layout.tsx`:

```tsx
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { ANALYTICS_CONFIG } from '@/config/analytics';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* Google Analytics */}
        <GoogleAnalytics measurementId={ANALYTICS_CONFIG.GOOGLE_ANALYTICS_ID} />
        <PageViewTracker />
        {/* ... resto del layout */}
      </body>
    </html>
  );
}
```

## 🧩 Componentes Creados

### GoogleAnalytics Component

```tsx
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

// Uso básico
<GoogleAnalytics measurementId="G-4N4QVEB03T" />
```

**Características:**
- Carga el script de Google Analytics de forma optimizada
- Configuración automática con parámetros de privacidad
- Debug mode en desarrollo
- Anonimización de IPs

### PageViewTracker Component

```tsx
import PageViewTracker from '@/components/analytics/PageViewTracker';

// Se incluye automáticamente en el layout
<PageViewTracker />
```

**Características:**
- Tracking automático de navegación entre páginas
- Incluye parámetros de búsqueda en las URLs
- Compatible con App Router de Next.js

## 🎣 Hook de Google Analytics

### Importación

```tsx
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { ANALYTICS_CONFIG } from '@/config/analytics';
```

### Métodos Disponibles

```tsx
const {
  trackEvent,        // Evento personalizado
  trackPageView,     // Vista de página
  trackSearch,       // Búsqueda
  trackPublication,  // Publicación
  trackUserAction    // Acción de usuario
} = useGoogleAnalytics();
```

## 📊 Eventos Personalizados

### Eventos Predefinidos

```tsx
// En src/config/analytics.ts
EVENTS: {
  // Publicaciones
  PUBLICATION_VIEW: 'publication_view',
  PUBLICATION_CREATE: 'publication_create',
  PUBLICATION_EDIT: 'publication_edit',
  PUBLICATION_DELETE: 'publication_delete',
  
  // Búsquedas
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_FILTER_APPLIED: 'search_filter_applied',
  
  // Usuario
  USER_LOGIN: 'user_login',
  USER_REGISTER: 'user_register',
  USER_LOGOUT: 'user_logout',
  
  // Engagement
  CONTACT_SENT: 'contact_sent',
  FAVORITE_ADDED: 'favorite_added',
  FAVORITE_REMOVED: 'favorite_removed',
  
  // Navegación
  CATEGORY_VIEW: 'category_view',
  LOCATION_SELECTED: 'location_selected',
}
```

### Categorías

```tsx
CATEGORIES: {
  ENGAGEMENT: 'engagement',
  PUBLICATION: 'publication',
  USER: 'user',
  SEARCH: 'search',
  NAVIGATION: 'navigation',
}
```

## 💡 Ejemplos de Uso

### 1. Tracking de Búsqueda

```tsx
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { ANALYTICS_CONFIG } from '@/config/analytics';

export default function SearchComponent() {
  const { trackSearch, trackUserAction } = useGoogleAnalytics();

  const handleSearch = (query: string) => {
    // Track búsqueda básica
    trackSearch(query, resultsCount);
    
    // Track evento personalizado
    trackUserAction(
      ANALYTICS_CONFIG.EVENTS.SEARCH_PERFORMED,
      ANALYTICS_CONFIG.CATEGORIES.SEARCH,
      query
    );
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSearch(searchTerm);
    }}>
      {/* ... */}
    </form>
  );
}
```

### 2. Tracking de Publicaciones

```tsx
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { ANALYTICS_CONFIG } from '@/config/analytics';

export default function PublicationComponent() {
  const { trackPublication, trackUserAction } = useGoogleAnalytics();

  const handlePublicationView = (publicationId: string, category: string) => {
    // Track vista de publicación
    trackPublication(category, 'view');
    
    // Track evento personalizado con más detalles
    trackUserAction(
      ANALYTICS_CONFIG.EVENTS.PUBLICATION_VIEW,
      ANALYTICS_CONFIG.CATEGORIES.PUBLICATION,
      publicationId
    );
  };

  const handlePublicationCreate = (category: string) => {
    trackPublication(category, 'create');
  };

  return (
    <div onClick={() => handlePublicationView(id, category)}>
      {/* ... */}
    </div>
  );
}
```

### 3. Tracking de Usuario

```tsx
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { ANALYTICS_CONFIG } from '@/config/analytics';

export default function AuthComponent() {
  const { trackUserAction } = useGoogleAnalytics();

  const handleLogin = (method: string) => {
    trackUserAction(
      ANALYTICS_CONFIG.EVENTS.USER_LOGIN,
      ANALYTICS_CONFIG.CATEGORIES.USER,
      method // 'email', 'google', 'facebook', etc.
    );
  };

  const handleRegister = (method: string) => {
    trackUserAction(
      ANALYTICS_CONFIG.EVENTS.USER_REGISTER,
      ANALYTICS_CONFIG.CATEGORIES.USER,
      method
    );
  };

  return (
    <div>
      <button onClick={() => handleLogin('email')}>Login</button>
      <button onClick={() => handleRegister('email')}>Register</button>
    </div>
  );
}
```

### 4. Tracking de Engagement

```tsx
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { ANALYTICS_CONFIG } from '@/config/analytics';

export default function EngagementComponent() {
  const { trackUserAction } = useGoogleAnalytics();

  const handleContact = (publicationId: string) => {
    trackUserAction(
      ANALYTICS_CONFIG.EVENTS.CONTACT_SENT,
      ANALYTICS_CONFIG.CATEGORIES.ENGAGEMENT,
      publicationId
    );
  };

  const handleFavorite = (publicationId: string, isAdding: boolean) => {
    const event = isAdding 
      ? ANALYTICS_CONFIG.EVENTS.FAVORITE_ADDED
      : ANALYTICS_CONFIG.EVENTS.FAVORITE_REMOVED;
    
    trackUserAction(
      event,
      ANALYTICS_CONFIG.CATEGORIES.ENGAGEMENT,
      publicationId
    );
  };

  return (
    <div>
      <button onClick={() => handleContact(id)}>Contactar</button>
      <button onClick={() => handleFavorite(id, true)}>Favorito</button>
    </div>
  );
}
```

### 5. Evento Personalizado Avanzado

```tsx
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

export default function CustomTrackingComponent() {
  const { trackEvent } = useGoogleAnalytics();

  const handleCustomAction = () => {
    trackEvent(
      'custom_action',           // action
      'custom_category',         // category
      'custom_label',           // label
      100                       // value (opcional)
    );
  };

  return (
    <button onClick={handleCustomAction}>
      Acción Personalizada
    </button>
  );
}
```

## 🔒 Configuración de Privacidad

### Configuraciones Aplicadas

```tsx
// En GoogleAnalytics.tsx
gtag('config', measurementId, {
  debug_mode: process.env.NODE_ENV === 'development',
  anonymize_ip: true,                    // Anonimiza IPs
  cookie_flags: 'SameSite=None;Secure',  // Cookies seguras
});
```

### Cumplimiento GDPR

- **Anonimización de IPs**: Habilitada por defecto
- **Cookies Seguras**: Configuradas con SameSite=None;Secure
- **Debug Mode**: Solo en desarrollo

## 🐛 Debugging

### 1. Verificar Instalación

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes de Google Analytics
4. Verifica que `window.gtag` esté disponible

### 2. Debug Mode

En desarrollo, el debug mode está habilitado automáticamente. Verás mensajes como:

```
[GTM] Event: search
[GTM] Event: publication_view
```

### 3. Verificar Eventos

1. Abre Google Analytics Real-Time
2. Realiza acciones en tu aplicación
3. Verifica que los eventos aparezcan en tiempo real

### 4. Herramientas de Desarrollo

```tsx
// En la consola del navegador
console.log(window.dataLayer); // Ver todos los eventos
console.log(window.gtag);      // Verificar función gtag
```

## 📈 Métricas Recomendadas

### Eventos Clave a Trackear

1. **Búsquedas**: `search_performed`
2. **Vistas de Publicación**: `publication_view`
3. **Creación de Publicaciones**: `publication_create`
4. **Contactos**: `contact_sent`
5. **Favoritos**: `favorite_added`, `favorite_removed`
6. **Registros/Logins**: `user_register`, `user_login`
7. **Navegación por Categorías**: `category_view`

### Configuración de Goals en GA4

1. **Búsquedas**: Evento `search_performed`
2. **Contactos**: Evento `contact_sent`
3. **Registros**: Evento `user_register`
4. **Publicaciones Creadas**: Evento `publication_create`

## 🔧 Personalización Avanzada

### Agregar Nuevos Eventos

1. Actualiza `src/config/analytics.ts`:

```tsx
EVENTS: {
  // ... eventos existentes
  NEW_CUSTOM_EVENT: 'new_custom_event',
}
```

2. Usa el evento en tu componente:

```tsx
trackUserAction(
  ANALYTICS_CONFIG.EVENTS.NEW_CUSTOM_EVENT,
  ANALYTICS_CONFIG.CATEGORIES.ENGAGEMENT,
  'custom_label'
);
```

### Configuración de Variables de Entorno

Para diferentes entornos, puedes usar variables de entorno:

```tsx
// .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-4N4QVEB03T
NEXT_PUBLIC_GA_DEBUG_MODE=true
```

Y actualizar la configuración:

```tsx
// src/config/analytics.ts
GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-4N4QVEB03T',
```

## 📚 Recursos Adicionales

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Script Component](https://nextjs.org/docs/basic-features/script)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Privacy and Security in GA4](https://support.google.com/analytics/answer/9019185)

---

**Nota**: Esta configuración está optimizada para Next.js 13+ con App Router y sigue las mejores prácticas de privacidad y rendimiento. 