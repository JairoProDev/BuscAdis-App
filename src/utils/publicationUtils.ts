import { Publication } from '@/types/publications';

/**
 * Calcula la fecha de caducidad basada en la fecha de publicación original
 * @param originalPublicationDate - Fecha de publicación en la revista
 * @returns Fecha de caducidad (3 días después)
 */
export function calculateExpirationDate(originalPublicationDate: Date): Date {
  const expirationDate = new Date(originalPublicationDate);
  expirationDate.setDate(expirationDate.getDate() + 3);
  return expirationDate;
}

/**
 * Determina si una publicación está caducada
 * @param publication - Publicación a verificar
 * @returns true si está caducada
 */
export function isPublicationExpired(publication: Publication): boolean {
  if (!publication.expirationDate) {
    return false; // Si no tiene fecha de caducidad, no está caducada
  }
  return new Date() > new Date(publication.expirationDate);
}

/**
 * Determina el estado actual de una publicación
 * @param publication - Publicación a verificar
 * @returns Estado actual: 'active', 'expired', 'archived'
 */
export function getPublicationStatus(publication: Publication): 'active' | 'expired' | 'archived' {
  if (publication.status === 'archived') {
    return 'archived';
  }
  
  if (isPublicationExpired(publication)) {
    return 'expired';
  }
  
  return 'active';
}

/**
 * Obtiene información de contacto segura (oculta si está caducada)
 * @param publication - Publicación
 * @returns Información de contacto o null si está caducada
 */
export function getSafeContactInfo(publication: Publication) {
  if (isPublicationExpired(publication)) {
    return null;
  }
  
  return publication.contact;
}

/**
 * Formatea la fecha de publicación para mostrar
 * @param date - Fecha a formatear
 * @returns String formateado
 */
export function formatPublicationDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hoy';
  } else if (diffDays === 1) {
    return 'Ayer';
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }
}

/**
 * Genera un slug único para la publicación
 * @param title - Título de la publicación
 * @param id - ID único
 * @returns Slug formateado
 */
export function generatePublicationSlug(title: string, id: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return `${cleanTitle}-${id}`;
}

/**
 * Valida si una publicación histórica tiene todos los campos requeridos
 * @param publication - Publicación a validar
 * @returns true si es válida
 */
export function validateHistoricalPublication(publication: Partial<Publication>): boolean {
  const requiredFields = [
    'title',
    'description',
    'categorySlug',
    'subcategorySlug',
    'originalPublicationDate',
    'contact'
  ];
  
  return requiredFields.every(field => {
    const value = publication[field as keyof Publication];
    if (field === 'contact') {
      return value && typeof value === 'object' && 'phones' in value && Array.isArray((value as any).phones) && (value as any).phones.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  });
}

/**
 * Prepara una publicación histórica para inserción en la base de datos
 * @param publicationData - Datos de la publicación
 * @returns Publicación preparada
 */
export function prepareHistoricalPublication(publicationData: Partial<Publication>): Publication {
  const originalDate = new Date(publicationData.originalPublicationDate!);
  
  return {
    ...publicationData,
    originalPublicationDate: originalDate,
    expirationDate: calculateExpirationDate(originalDate),
    isHistoricalPublication: true,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    images: publicationData.images || [],
    attributes: publicationData.attributes || null,
  } as Publication;
}

/**
 * Calcula estadísticas de publicaciones históricas
 * @param publications - Array de publicaciones
 * @returns Estadísticas calculadas
 */
export function calculateHistoricalStats(publications: Publication[]) {
  const stats = {
    total: publications.length,
    active: 0,
    expired: 0,
    archived: 0,
    byCategory: {} as Record<string, number>,
    byMonth: {} as Record<string, number>,
    averagePrice: 0,
    priceRange: { min: 0, max: 0 },
    withContact: 0,
    withoutContact: 0,
  };
  
  let totalPrice = 0;
  let priceCount = 0;
  const prices: number[] = [];
  
  publications.forEach(pub => {
    // Estado
    const status = getPublicationStatus(pub);
    stats[status]++;
    
    // Categoría
    const category = pub.categorySlug;
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    
    // Mes
    if (pub.originalPublicationDate) {
      const month = pub.originalPublicationDate.toISOString().substring(0, 7); // YYYY-MM
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    }
    
    // Precio
    if (pub.amount && pub.amount > 0) {
      totalPrice += pub.amount;
      priceCount++;
      prices.push(pub.amount);
    }
    
    // Contacto
    if (pub.contact?.phones?.length > 0) {
      stats.withContact++;
    } else {
      stats.withoutContact++;
    }
  });
  
  // Calcular promedio y rango de precios
  if (priceCount > 0) {
    stats.averagePrice = totalPrice / priceCount;
    stats.priceRange.min = Math.min(...prices);
    stats.priceRange.max = Math.max(...prices);
  }
  
  return stats;
} 