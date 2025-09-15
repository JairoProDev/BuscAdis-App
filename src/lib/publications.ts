import { PublicationData } from '@/types/publication';

/**
 * Obtiene una publicación por slug, sequentialId o ID con resolución flexible
 * @param identifier - Puede ser sequentialId, ID o parte del slug
 * @param slug - Slug completo para verificación adicional
 * @returns Publicación encontrada o null
 */
export async function getPublicationBySlugOrId(identifier: string, slug?: string): Promise<PublicationData | null> {
  try {
    // Primero intentamos por sequentialId exacto
    if (isNumeric(identifier)) {
      const bySequentialId = await fetchPublicationBySequentialId(parseInt(identifier));
      if (bySequentialId) return bySequentialId;
    }

    // Luego por ID exacto
    const byId = await fetchPublicationById(identifier);
    if (byId) return byId;

    // Finalmente por slug (búsqueda flexible)
    if (slug) {
      const bySlug = await fetchPublicationBySlug(slug, identifier);
      if (bySlug) return bySlug;
    }

    return null;
  } catch (error) {
    console.error('Error in getPublicationBySlugOrId:', error);
    return null;
  }
}

/**
 * Verifica si un string es numérico
 */
function isNumeric(str: string): boolean {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}

/**
 * Busca publicación por sequentialId
 */
async function fetchPublicationBySequentialId(sequentialId: number): Promise<PublicationData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publications/by-sequential/${sequentialId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.publication || null;
  } catch (error) {
    console.error('Error fetching by sequentialId:', error);
    return null;
  }
}

/**
 * Busca publicación por ID
 */
async function fetchPublicationById(id: string): Promise<PublicationData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publications/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.publication || null;
  } catch (error) {
    console.error('Error fetching by ID:', error);
    return null;
  }
}

/**
 * Busca publicación por slug (búsqueda flexible)
 */
async function fetchPublicationBySlug(slug: string, identifier?: string): Promise<PublicationData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/publications/by-slug/${encodeURIComponent(slug)}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.publication || null;
  } catch (error) {
    console.error('Error fetching by slug:', error);
    return null;
  }
}

/**
 * Genera URL para feed principal
 */
export function generateFeedUrl(publication: PublicationData): string {
  const slug = slugify(publication.title);
  const sequentialId = (publication as any).sequentialId || publication.id;
  return `/adisos/${sequentialId}/${slug}`;
}

/**
 * Genera URL para categoría específica
 */
export function generateCategoryUrl(publication: PublicationData): string {
  const slug = slugify(publication.title);
  const sequentialId = (publication as any).sequentialId || publication.id;
  const category = publication.categorySlug || 'general';
  const subcategory = publication.subcategorySlug;
  
  // Si no hay subcategoría, usar estructura simple
  if (subcategory && subcategory !== 'general') {
    return `/${category}/${subcategory}/adiso/${sequentialId}/${slug}`;
  } else {
    return `/${category}/adiso/${sequentialId}/${slug}`;
  }
}

/**
 * Genera URL para página dedicada de negocio
 */
export function generateBusinessUrl(publication: PublicationData): string {
  const slug = slugify(publication.title);
  const sequentialId = (publication as any).sequentialId || publication.id;
  
  // Si tiene información de negocio, usar el nombre del negocio
  const businessName = (publication as any).businessName || 
                      (publication as any).publisherName ||
                      (publication as any).userProfile?.displayName;
  
  if (businessName) {
    const businessSlug = slugify(businessName);
    return `/negocio/${businessSlug}/${sequentialId}/${slug}`;
  }
  
  // Fallback sin nombre de negocio - usar feed principal
  return `/adisos/${sequentialId}/${slug}`;
}

/**
 * Función slugify mejorada
 */
function slugify(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}


