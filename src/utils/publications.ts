// ============================================================================
// UTILITY FUNCTIONS FOR PUBLICATION DATA HANDLING
// ============================================================================

import { PublicationData } from '@/types/publication'

// Centralised interface for search results to avoid inconsistencies
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  image: string;
  createdAt: string;
  views: number;
  featured?: boolean;
  premium?: boolean;
  subcategorySlug?: string;
}

/**
 * Converts SearchResult to PublicationData format
 * Centralized to avoid duplication across multiple files
 */
export function convertSearchResultToPublicationData(searchResult: SearchResult): PublicationData {
  if (!searchResult?.id) {
    throw new Error('SearchResult must have a valid id');
  }

  const locationParts = (searchResult.location || '').split(',').map(part => part.trim());
  
  return {
    id: searchResult.id,
    title: searchResult.title || 'Sin título',
    description: searchResult.description || '',
    categorySlug: searchResult.category?.toLowerCase() || 'general',
    subcategorySlug: searchResult.subcategorySlug || null,
    subSubcategorySlug: null,
    transactionType: 'venta',
    value: searchResult.price || 0,
    currency: 'PEN',
    valueType: 'fixed',
    size: 0,
    location: {
      district: locationParts[0] || '',
      province: locationParts[1] || '',
      city: locationParts[2] || 'Cusco',
      country: 'Perú'
    },
    images: searchResult.image ? [searchResult.image] : [],
    whatsapp: '51987654321', // Default WhatsApp number - should be replaced with actual contact data
    createdAt: searchResult.createdAt || new Date().toISOString(),
    views: searchResult.views || Math.floor(Math.random() * 500) + 50,
    featured: searchResult.featured || false,
    premium: searchResult.premium || false,
  };
}

/**
 * Validates if a publication has the minimum required data
 */
export function validatePublicationData(publication: Partial<PublicationData>): publication is PublicationData {
  return !!(
    publication.id &&
    publication.title &&
    publication.categorySlug &&
    publication.location
  );
}

/**
 * Normalizes publication data to ensure consistency
 */
export function normalizePublicationData(publication: unknown): PublicationData {
  return {
    id: (publication as Record<string, unknown>)?._id || (publication as Record<string, unknown>)?.id,
    title: (publication as Record<string, unknown>)?.title || 'Sin título',
    description: (publication as Record<string, unknown>)?.description || '',
    categorySlug: (publication as Record<string, unknown>)?.categorySlug || (publication as Record<string, unknown>)?.category || 'general',
    subcategorySlug: (publication as Record<string, unknown>)?.subcategorySlug || (publication as Record<string, unknown>)?.subcategory || null,
    subSubcategorySlug: (publication as Record<string, unknown>)?.subSubcategorySlug || (publication as Record<string, unknown>)?.subsubcategory || null,
    transactionType: (publication as Record<string, unknown>)?.transactionType || 'venta',
    value: (publication as Record<string, unknown>)?.value || (publication as Record<string, unknown>)?.price || (publication as Record<string, unknown>)?.amount || 0,
    currency: (publication as Record<string, unknown>)?.currency || 'PEN',
    valueType: (publication as Record<string, unknown>)?.valueType || 'fixed',
    size: (publication as Record<string, unknown>)?.size || 0,
    location: normalizeLocationData(publication),
    images: Array.isArray((publication as Record<string, unknown>)?.images) ? (publication as Record<string, unknown>)?.images : [],
    whatsapp: (publication as Record<string, unknown>)?.whatsapp || (publication as Record<string, unknown>)?.contact?.phones?.[0] || '',
    createdAt: (publication as Record<string, unknown>)?.createdAt || new Date().toISOString(),
    views: (publication as Record<string, unknown>)?.views || 0,
    featured: (publication as Record<string, unknown>)?.featured || false,
    premium: (publication as Record<string, unknown>)?.premium || false,
  };
}

/**
 * Normalizes location data to ensure consistent structure
 */
function normalizeLocationData(location: unknown): PublicationData['location'] {
  if (typeof location === 'string') {
    const parts = location.split(',').map(part => part.trim());
    return {
      district: parts[0] || '',
      province: parts[1] || '',
      city: parts[2] || 'Cusco',
      country: 'Perú'
    };
  }
  
  if (typeof location === 'object' && location !== null) {
    return {
      reference: (location as Record<string, unknown>)?.reference,
      district: (location as Record<string, unknown>)?.district || '',
      province: (location as Record<string, unknown>)?.province || '',
      city: (location as Record<string, unknown>)?.city || 'Cusco',
      country: (location as Record<string, unknown>)?.country || 'Perú'
    };
  }
  
  return {
    district: '',
    province: '',
    city: 'Cusco',
    country: 'Perú'
  };
}

/**
 * Checks if a publication has valid images
 */
export function hasValidImages(publication: PublicationData | unknown): boolean {
  if (!publication?.images || !Array.isArray(publication.images)) {
    return false;
  }
  
  return publication.images.length > 0 && 
    publication.images[0] !== '/images/placeholder-image.jpg' && 
    publication.images[0] !== '/images/defaults/default.jpg' &&
    publication.images[0].trim() !== '';
}

/**
 * Checks if a publication is new (less than 24 hours old)
 */
export function isPublicationNew(createdAt: string): boolean {
  try {
    const publicationDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - publicationDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  } catch (error) {
    console.warn('Error parsing publication date:', createdAt, error);
    return false;
  }
}

/**
 * Gets display text for publication location
 */
export function getLocationDisplayText(location: PublicationData['location']): string {
  if (!location) return 'Sin ubicación';
  
  const parts = [
    location.district,
    location.province,
    location.city
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : 'Sin ubicación';
}

/**
 * Error handling utility for publication operations
 */
export class PublicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public publicationId?: string
  ) {
    super(message);
    this.name = 'PublicationError';
  }
}

/**
 * Safe getter for publication properties with fallbacks
 */
export function getPublicationProperty<T>(
  publication: Record<string, unknown>,
  property: string,
  fallback: T
): T {
  try {
    return publication?.[property] ?? fallback;
  } catch (error) {
    console.warn(`Error accessing property ${property} on publication:`, error);
    return fallback;
  }
} 