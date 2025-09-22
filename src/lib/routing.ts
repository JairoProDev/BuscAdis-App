/**
 * Sistema de routing profesional para BuscaDis
 * Arquitectura limpia, SEO-friendly y mantenible
 */

import { PublicationData } from '@/types/publication'

// ============================================================================
// TYPES
// ============================================================================

export interface RouteParams {
  category?: string
  subcategory?: string
  id: string
  slug?: string
}

export interface ParsedRoute {
  type: 'home' | 'category' | 'publication'
  category?: string
  subcategory?: string
  publicationId?: string
  slug?: string
}

// ============================================================================
// URL GENERATION
// ============================================================================

/**
 * Genera un slug SEO-friendly a partir de un texto
 */
export function createSlug(text: string): string {
  if (!text || typeof text !== 'string') return ''
  
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, '') // Remover guiones al inicio/final
}

/**
 * Genera URL para página dedicada de publicación
 */
export function generatePublicationUrl(publication: PublicationData): string {
  const id = publication.sequentialId || publication.id
  const slug = createSlug(publication.title)
  return `/adiso/${id}/${slug}`
}

/**
 * Genera URL para publicación dentro de categoría
 */
export function generateCategoryPublicationUrl(
  publication: PublicationData,
  category: string,
  subcategory?: string
): string {
  const id = publication.sequentialId || publication.id
  const slug = createSlug(publication.title)
  
  if (subcategory && subcategory !== 'general') {
    return `/${category}/${subcategory}/${id}/${slug}`
  }
  
  return `/${category}/${id}/${slug}`
}

/**
 * Genera URL para página de categoría
 */
export function generateCategoryUrl(category: string, subcategory?: string): string {
  if (subcategory && subcategory !== 'general') {
    return `/${category}/${subcategory}`
  }
  
  return `/${category}`
}

// ============================================================================
// URL PARSING
// ============================================================================

/**
 * Parsea una ruta y determina su tipo y parámetros
 */
export function parseRoute(pathname: string): ParsedRoute {
  const segments = pathname.split('/').filter(Boolean)
  
  // Página principal
  if (segments.length === 0) {
    return { type: 'home' }
  }
  
  // Página dedicada de publicación: /adiso/:id/:slug?
  if (segments[0] === 'adiso' && segments.length >= 2) {
    return {
      type: 'publication',
      publicationId: segments[1],
      slug: segments[2]
    }
  }
  
  // Rutas de categoría
  const validCategories = [
    'empleos', 'inmuebles', 'vehiculos', 'servicios', 
    'productos', 'eventos', 'negocios', 'comunidad'
  ]
  
  if (validCategories.includes(segments[0])) {
    const category = segments[0]
    
    // Solo categoría: /empleos
    if (segments.length === 1) {
      return { type: 'category', category }
    }
    
    // Categoría con subcategoría: /empleos/administrativo
    if (segments.length === 2 && isNaN(Number(segments[1]))) {
      return { 
        type: 'category', 
        category, 
        subcategory: segments[1] 
      }
    }
    
    // Publicación en categoría: /empleos/123/slug o /empleos/subcategoria/123/slug
    if (segments.length >= 3) {
      const secondSegment = segments[1]
      
      if (!isNaN(Number(secondSegment))) {
        // /empleos/123/slug
        return {
          type: 'publication',
          category,
          publicationId: secondSegment,
          slug: segments[2]
        }
      } else if (segments.length >= 4 && !isNaN(Number(segments[2]))) {
        // /empleos/subcategoria/123/slug
        return {
          type: 'publication',
          category,
          subcategory: secondSegment,
          publicationId: segments[2],
          slug: segments[3]
        }
      }
    }
  }
  
  // Fallback para rutas no reconocidas
  return { type: 'home' }
}

// ============================================================================
// ROUTE VALIDATION
// ============================================================================

/**
 * Valida si una categoría es válida
 */
export function isValidCategory(category: string): boolean {
  const validCategories = [
    'empleos', 'inmuebles', 'vehiculos', 'servicios', 
    'productos', 'eventos', 'negocios', 'comunidad'
  ]
  
  return validCategories.includes(category)
}

/**
 * Valida si una subcategoría es válida para una categoría
 */
export function isValidSubcategory(category: string, subcategory: string): boolean {
  const subcategoriesByCategory: Record<string, string[]> = {
    empleos: [
      'administrativo', 'ventas', 'atencion-cliente', 'educacion',
      'salud', 'tecnologia', 'marketing', 'gastronomia', 'construccion',
      'turismo', 'otros'
    ],
    inmuebles: [
      'casas', 'departamentos', 'terrenos', 'oficinas', 'locales',
      'quintas', 'otros'
    ],
    vehiculos: [
      'autos', 'motos', 'camiones', 'buses', 'bicicletas', 'otros'
    ],
    servicios: [
      'limpieza', 'construccion', 'tecnologia', 'educacion',
      'salud', 'belleza', 'eventos', 'otros'
    ],
    productos: [
      'electronica', 'ropa', 'hogar', 'deportes', 'libros',
      'juguetes', 'otros'
    ]
  }
  
  const validSubcategories = subcategoriesByCategory[category]
  return validSubcategories ? validSubcategories.includes(subcategory) : false
}

// ============================================================================
// BROWSER HISTORY
// ============================================================================

/**
 * Navega a una URL de forma programática
 */
export function navigateToUrl(url: string, replace = false): void {
  if (typeof window === 'undefined') return
  
  if (replace) {
    window.history.replaceState(null, '', url)
  } else {
    window.history.pushState(null, '', url)
  }
}

/**
 * Obtiene la URL actual sin el origin
 */
export function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}
