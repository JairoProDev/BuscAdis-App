/**
 * CENTRALIZED TYPE DEFINITIONS FOR BUSCADIS
 * 
 * This file consolidates all shared types to avoid duplication
 * and ensure consistency across the application.
 */

// ============================================================================
// CORE PUBLICATION TYPES
// ============================================================================

export interface PublicationData {
  id: string;
  sequentialId?: number;
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
  location: PublicationLocation;
  images: string[];
  whatsapp: string;
  createdAt: string;
  updatedAt?: string;
  views: number;
  featured?: boolean;
  premium?: boolean;
  negotiable?: boolean;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: 'active' | 'expired' | 'draft' | 'sold';
  attributes?: Record<string, any>;
}

export interface PublicationLocation {
  reference?: string;
  district: string;
  province: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export interface PublicationApiResponse extends ApiResponse {
  publications: PublicationData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
  location?: string;
  district?: string;
  province?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'recent' | 'price_asc' | 'price_desc' | 'relevance';
  page?: number;
  limit?: number;
  premium?: boolean;
  featured?: boolean;
}

export interface SearchResult {
  publications: PublicationData[];
  total: number;
  filters: SearchFilters;
  suggestions?: string[];
  trending?: string[];
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
  statistics?: UserStatistics;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    showLocation: boolean;
  };
}

export interface UserStatistics {
  publicationsCount: number;
  viewsCount: number;
  contactsCount: number;
  responseRate: number;
  averageResponseTime: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  type: 'view' | 'contact' | 'search' | 'favorite' | 'share';
  publicationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  referer?: string;
}

export interface AnalyticsMetrics {
  totalViews: number;
  totalContacts: number;
  totalSearches: number;
  uniqueUsers: number;
  averageSessionTime: number;
  bounceRate: number;
  conversionRate: number;
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  topLocations: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
}

// ============================================================================
// PREMIUM FEATURES TYPES
// ============================================================================

export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number; // days
  features: PremiumFeature[];
  limits: PremiumLimits;
  popular?: boolean;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface PremiumLimits {
  publications: number;
  images: number;
  featuredDays: number;
  boostDays: number;
  analytics: boolean;
  priority: boolean;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface PublicationCardProps {
  publication: PublicationData;
  variant?: 'grid' | 'list' | 'featured';
  showWhatsApp?: boolean;
  onPublicationClick?: (publication: PublicationData) => void;
  onWhatsAppClick?: (publication: PublicationData) => void;
  onFavoriteClick?: (publication: PublicationData) => void;
  className?: string;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  initialValue?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'relevance' | 'popular';

export type CategorySlug = 
  | 'empleos' 
  | 'inmuebles' 
  | 'vehiculos' 
  | 'servicios' 
  | 'productos' 
  | 'eventos' 
  | 'negocios' 
  | 'comunidad';

export type PublicationStatus = 'active' | 'expired' | 'draft' | 'sold';

export type TransactionType = 'venta' | 'alquiler' | 'intercambio' | 'donacion';

export type Currency = 'PEN' | 'USD' | 'EUR';

// ============================================================================
// RE-EXPORTS FROM OTHER TYPE FILES
// ============================================================================

export type { 
  Publication,
  ExtendedLocation 
} from '../components/search/SearchResults';

export type { 
  MongoDbDocument,
  PublicationDocument,
  PublicationFilters 
} from '../lib/mongodb-server';

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isPublicationData(obj: any): obj is PublicationData {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.categorySlug === 'string';
}

export function isPremiumPlan(obj: any): obj is PremiumPlan {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    Array.isArray(obj.features);
}

export function isValidCategorySlug(slug: string): slug is CategorySlug {
  const validSlugs: CategorySlug[] = [
    'empleos', 'inmuebles', 'vehiculos', 'servicios',
    'productos', 'eventos', 'negocios', 'comunidad'
  ];
  return validSlugs.includes(slug as CategorySlug);
}
