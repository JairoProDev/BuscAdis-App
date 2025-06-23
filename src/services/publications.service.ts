import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '@/features/auth/services/auth.service';
import { Logger } from '@/services/logging.service';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

interface MediaItem {
    url: string;
    type: string;
}

interface Location {
    district?: { id: string; name: string };
    region?: { id: string; name: string };
    coordinates?: { lat: number; lon: number } | null;
    city?: string;
    country?: string;
}

interface Price {
    amount: number;
    currency: string;
    type: string;
}

export interface QuickPublicationData {
    title: string;
    description: string;
    category?: { id: string; name: string; subcategories?: Array<{ id: string; name: string; selected?: boolean }> };
    type?: string;
    contact: { whatsapp: string; email?: string };
    media: MediaItem[];
    location?: Location;
    price?: Price;
    priceType?: string;
}

interface PublicationParams {
    category?: string;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    sortBy?: string;
    page: number;
    limit?: number;
}

// Interfaces
export interface Publication {
  _id: string;
  title: string;
  description: string;
  categorySlug: string;
  subcategorySlug?: string;
  subSubcategorySlug?: string;
  transactionType: string;
  value: number;
  currency: string;
  valueType: string;
  size?: number;
  location: {
    country: string;
    province: string;
    city: string;
    district?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phones: string[];
    email?: string;
    name?: string;
    visible?: boolean;
  };
  images: string[];
  status: string;
  premium: boolean;
  createdAt: string;
  updatedAt?: string;
  views?: number;
  isActive?: boolean;
  expirationDate?: string;
  estado?: 'activo' | 'vencido' | 'historico';
  reactivaciones?: Array<{
    fecha: string;
    nueva_fecha_vencimiento: string;
    costo: number;
  }>;
  fuente?: string;
  revista_original?: string;
  datos_extraccion?: {
    metodo: string;
    confianza: number;
    fecha_procesamiento: string;
  };
}

export interface PublicationQuery {
  category?: string;
  subcategory?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  status?: 'activo' | 'vencido' | 'historico';
  premium?: boolean;
  limit?: number;
  skip?: number;
  sortBy?: 'recent' | 'price-asc' | 'price-desc' | 'views' | 'premium';
}

export interface PublicationResponse {
  publications: Publication[];
  total: number;
  hasMore: boolean;
  filters?: {
    categories: string[];
    locations: string[];
    priceRange: { min: number; max: number };
  };
}

/**
 * Pure client-side service for interacting with publications via API endpoints
 */
export class PublicationsService {
    // API endpoints
    private static readonly ENDPOINTS = {
        PUBLICATIONS: '/api/publications',
        PUBLICATION: (id: string) => `/api/publications/${id}`,
        RELATED_PUBLICATIONS: '/api/publications/related',
        USER_PUBLICATIONS: (userId: string) => `/api/users/${userId}/publications`,
    };

    private static baseUrl = '/api/publications';

    /**
     * Obtener publicaciones con filtros
     */
    static async getPublications(query: PublicationQuery = {}): Promise<PublicationResponse> {
        try {
            const params = new URLSearchParams();
            
            // Agregar parámetros de consulta
            if (query.category) params.append('category', query.category);
            if (query.subcategory) params.append('subcategory', query.subcategory);
            if (query.location) params.append('location', query.location);
            if (query.priceMin !== undefined) params.append('priceMin', query.priceMin.toString());
            if (query.priceMax !== undefined) params.append('priceMax', query.priceMax.toString());
            if (query.search) params.append('search', query.search);
            if (query.status) params.append('status', query.status);
            if (query.premium !== undefined) params.append('premium', query.premium.toString());
            if (query.limit) params.append('limit', query.limit.toString());
            if (query.skip) params.append('skip', query.skip.toString());
            if (query.sortBy) params.append('sortBy', query.sortBy);

            const url = `${this.baseUrl}?${params.toString()}`;
            Logger.info('Fetching publications', { url, query });

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            Logger.info('Publications fetched successfully', { 
                count: data.publications?.length || 0,
                total: data.total || 0 
            });

            return {
                publications: data.publications || [],
                total: data.total || 0,
                hasMore: data.hasMore || false,
                filters: data.filters
            };

        } catch (error) {
            Logger.error('Error fetching publications', { error: error.message, query });
            
            // Retornar datos vacíos en lugar de propagar el error
            return {
                publications: [],
                total: 0,
                hasMore: false
            };
        }
    }

    /**
     * Obtener publicaciones premium para la fila destacada
     */
    static async getPremiumPublications(limit: number = 8): Promise<Publication[]> {
        try {
            const response = await this.getPublications({
                premium: true,
                status: 'activo',
                limit,
                sortBy: 'recent'
            });
            
            return response.publications;
        } catch (error) {
            Logger.error('Error fetching premium publications', { error: error.message });
            return [];
        }
    }

    /**
     * Obtener publicaciones recientes
     */
    static async getRecentPublications(limit: number = 12): Promise<Publication[]> {
        try {
            const response = await this.getPublications({
                status: 'activo',
                limit,
                sortBy: 'recent'
            });
            
            return response.publications;
        } catch (error) {
            Logger.error('Error fetching recent publications', { error: error.message });
            return [];
        }
    }

    /**
     * Obtener publicaciones por categoría
     */
    static async getPublicationsByCategory(category: string, limit: number = 10): Promise<Publication[]> {
        try {
            const response = await this.getPublications({
                category,
                status: 'activo',
                limit,
                sortBy: 'recent'
            });
            
            return response.publications;
        } catch (error) {
            Logger.error('Error fetching publications by category', { error: error.message, category });
            return [];
        }
    }

    /**
     * Obtener publicaciones próximas a vencer
     */
    static async getExpiringPublications(limit: number = 8): Promise<Publication[]> {
        try {
            // Por ahora usamos publicaciones recientes, después implementaremos la lógica de expiración
            const response = await this.getPublications({
                status: 'activo',
                limit,
                sortBy: 'recent'
            });
            
            return response.publications;
        } catch (error) {
            Logger.error('Error fetching expiring publications', { error: error.message });
            return [];
        }
    }

    /**
     * Obtener publicaciones trending/populares
     */
    static async getTrendingPublications(limit: number = 10): Promise<Publication[]> {
        try {
            const response = await this.getPublications({
                status: 'activo',
                limit,
                sortBy: 'views'
            });
            
            return response.publications;
        } catch (error) {
            Logger.error('Error fetching trending publications', { error: error.message });
            return [];
        }
    }

    /**
     * Obtener publicaciones por ubicación cercana
     */
    static async getNearbyPublications(location: string, limit: number = 8): Promise<Publication[]> {
        try {
            const response = await this.getPublications({
                location,
                status: 'activo',
                limit,
                sortBy: 'recent'
            });
            
            return response.publications;
        } catch (error) {
            Logger.error('Error fetching nearby publications', { error: error.message, location });
            return [];
        }
    }

    /**
     * Obtener publicaciones por rango de precio
     */
    static async getPublicationsByPriceRange(
        priceMin: number, 
        priceMax: number, 
        limit: number = 8
    ): Promise<Publication[]> {
        try {
            const response = await this.getPublications({
                priceMin,
                priceMax,
                status: 'activo',
                limit,
                sortBy: 'price-asc'
            });
            
            return response.publications;
        } catch (error) {
            Logger.error('Error fetching publications by price range', { 
                error: error.message, 
                priceMin, 
                priceMax 
            });
            return [];
        }
    }

    /**
     * Buscar publicaciones con texto
     */
    static async searchPublications(searchTerm: string, filters: PublicationQuery = {}): Promise<PublicationResponse> {
        try {
            return await this.getPublications({
                ...filters,
                search: searchTerm,
                status: 'activo'
            });
        } catch (error) {
            Logger.error('Error searching publications', { error: error.message, searchTerm });
            return {
                publications: [],
                total: 0,
                hasMore: false
            };
        }
    }

    /**
     * Obtener una publicación específica por ID
     */
    static async getPublicationById(id: string): Promise<Publication | null> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            Logger.info('Publication fetched by ID', { id });
            
            return data.publication || null;

        } catch (error) {
            Logger.error('Error fetching publication by ID', { error: error.message, id });
            return null;
        }
    }

    /**
     * Obtener estadísticas básicas
     */
    static async getStats(): Promise<{
        total: number;
        active: number;
        premium: number;
        categories: Record<string, number>;
    }> {
        try {
            const response = await fetch(`${this.baseUrl}/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            return data.stats || {
                total: 0,
                active: 0,
                premium: 0,
                categories: {}
            };

        } catch (error) {
            Logger.error('Error fetching stats', { error: error.message });
            return {
                total: 0,
                active: 0,
                premium: 0,
                categories: {}
            };
        }
    }

    /**
     * Fetch all publications with optional filtering
     */
    static async getPublications(options: any = {}) {
        try {
            // Build query params
            const params = new URLSearchParams();
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            
            // Fetch from API
            const response = await fetch(`${this.ENDPOINTS.PUBLICATIONS}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching publications:', error);
            throw error;
        }
    }
    
    /**
     * Create a new publication
     */
    static async createPublication(data: any) {
        try {
            const response = await fetch(this.ENDPOINTS.PUBLICATIONS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating publication:', error);
            throw error;
        }
    }
    
    /**
     * Update an existing publication
     */
    static async updatePublication(id: string, data: any) {
        try {
            const response = await fetch(this.ENDPOINTS.PUBLICATION(id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error updating publication ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Delete a publication
     */
    static async deletePublication(id: string) {
        try {
            const response = await fetch(this.ENDPOINTS.PUBLICATION(id), {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error deleting publication ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Get related publications
     */
    static async getRelatedPublications(id: string, category: string, limit: number = 6) {
        try {
            const params = new URLSearchParams({
                category,
                limit: limit.toString(),
                excludeId: id,
            });
            
            const response = await fetch(`${this.ENDPOINTS.RELATED_PUBLICATIONS}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching related publications for ${id}:`, error);
            return []; // Return empty array instead of throwing to gracefully handle this non-critical feature
        }
    }

    static async getPublicationsByUser(userId: string): Promise<any[]> {
        try {
            const response = await fetch(this.ENDPOINTS.USER_PUBLICATIONS(userId));
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting user publications:', error);
            return [];
        }
    }

    static async getAllPublications(): Promise<any[]> {
        try {
            // Use the regular getPublications method with a high limit
            const result = await this.getPublications({ limit: 100 });
            return result.publications || [];
        } catch (error) {
            console.error('Error getting all publications:', error);
            return [];
        }
    }
}

export default PublicationsService;