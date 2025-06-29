# Sistema de Vista Lateral/Modal para Publicaciones

Este sistema permite mostrar los detalles completos de una publicación sin navegar a otra página, optimizando la experiencia del usuario y manteniendo URLs SEO-friendly.

## Características

### Desktop (≥1024px)
- **Vista lateral**: Se abre un panel lateral derecho con todos los detalles de la publicación
- **Layout adaptativo**: El grid de publicaciones se reduce a 2 columnas cuando se abre el detalle
- **URLs SEO**: Se actualiza la URL sin navegación para mantener el estado

### Mobile (<1024px)
- **Modal deslizable**: Se abre un modal desde abajo hacia arriba
- **Gestos**: Se puede cerrar deslizando hacia abajo
- **Responsive**: Optimizado para pantallas pequeñas

## Componentes

### 1. PublicationDetailContainer
Componente principal que maneja la lógica de layout responsive.

```tsx
import PublicationDetailContainer from '@/components/publications/PublicationDetailContainer';

<PublicationDetailContainer
  publications={publicationsData}
  onPublicationClick={handlePublicationClick}
  viewMode="grid"
>
  {publications.map((publication) => (
    <PublicationCard
      key={publication.id}
      publication={publication}
      showWhatsApp={true}
      variant="default"
      viewMode="grid"
    />
  ))}
</PublicationDetailContainer>
```

### 2. PublicationDetailSidebar
Vista lateral para desktop con todos los detalles de la publicación.

### 3. PublicationDetailModal
Modal deslizable para mobile con funcionalidad de gestos.

### 4. usePublicationDetail Hook
Hook personalizado que maneja el estado y la lógica de URLs.

```tsx
import { usePublicationDetail } from '@/hooks/usePublicationDetail';

const {
  selectedPublication,
  isDetailOpen,
  isMobile,
  openPublicationDetail,
  closePublicationDetail,
  handleWhatsAppClick,
  handleShare,
  handleFavorite
} = usePublicationDetail();
```

## URLs SEO

El sistema genera URLs SEO-friendly automáticamente:

```
/buscar → /buscar/[category]/[subcategory]/[id]/[title-slug]
```

Ejemplo:
```
/buscar → /buscar/inmuebles/departamentos/12345/departamento-2-habitaciones-miraflores
```

## Implementación

### 1. En la página de búsqueda

```tsx
// src/app/buscar/page.tsx
import PublicationDetailContainer from '@/components/publications/PublicationDetailContainer';

function SearchPageContent() {
  const handlePublicationClick = (publication: SearchResult) => {
    // Convert to PublicationData format
    const publicationData = convertToPublicationData(publication);
    console.log('Publication clicked:', publicationData);
  };

  const publicationsData = results.map(convertToPublicationData);

  return (
    <PublicationDetailContainer
      publications={publicationsData}
      onPublicationClick={handlePublicationClick}
      viewMode={viewMode}
    >
      {results.map((publication) => (
        <PublicationCard
          key={publication.id}
          publication={convertToPublicationData(publication)}
          showWhatsApp={true}
          variant="default"
          viewMode={viewMode}
        />
      ))}
    </PublicationDetailContainer>
  );
}
```

### 2. Tipos de datos

```tsx
// src/types/publication.ts
export interface PublicationData {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string | null;
  subSubcategorySlug: string | null;
  transactionType: string;
  value: number;
  currency: string;
  valueType: string;
  size: number;
  location: {
    reference?: string;
    district: string;
    province: string;
    city: string;
    country: string;
  };
  images: string[];
  whatsapp: string;
  createdAt: string;
  views: number;
  featured?: boolean;
  premium?: boolean;
}
```

## Funcionalidades

### WhatsApp Integration
- Mensajes personalizados según la categoría
- Formato automático del número de teléfono
- Apertura en nueva pestaña

### Compartir
- Copia automática del enlace al portapapeles
- Integración con Web Share API
- URLs SEO-friendly

### Favoritos
- Almacenamiento local (localStorage)
- Integración futura con base de datos
- Estado persistente

### Navegación
- Soporte para botones atrás/adelante del navegador
- URLs actualizadas sin navegación
- Estado mantenido al recargar

## Responsive Design

### Desktop (≥1024px)
- Grid: 4 columnas → 2 columnas cuando se abre el detalle
- Sidebar: 50% del ancho (lg) o 40% (xl)
- Transiciones suaves

### Mobile (<1024px)
- Grid: 2 columnas siempre
- Modal: 90% de altura máxima
- Gestos de deslizamiento

## Personalización

### Colores y estilos
Los componentes usan Tailwind CSS y pueden personalizarse fácilmente:

```tsx
// Personalizar colores del sidebar
className="bg-white dark:bg-slate-900"

// Personalizar animaciones
transition={{ type: 'spring', damping: 25, stiffness: 200 }}
```

### Funcionalidades adicionales
Se pueden agregar más funcionalidades:

```tsx
// Agregar funcionalidad de reportar
onReport?: (publication: PublicationData) => void

// Agregar funcionalidad de guardar
onSave?: (publication: PublicationData) => void
```

## Ventajas

1. **UX mejorada**: No hay navegación entre páginas
2. **SEO optimizado**: URLs amigables para motores de búsqueda
3. **Responsive**: Funciona perfectamente en todos los dispositivos
4. **Performance**: Carga rápida sin recargar la página
5. **Accesibilidad**: Soporte completo para lectores de pantalla
6. **Gestos**: Interacciones naturales en mobile

## Consideraciones técnicas

- **SSR compatible**: Funciona con Next.js App Router
- **TypeScript**: Tipado completo para mejor desarrollo
- **Framer Motion**: Animaciones suaves y profesionales
- **Media Queries**: Detección robusta del tamaño de pantalla
- **History API**: Manejo avanzado del historial del navegador 