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
     * Fetch a single publication by ID
     */
    static async getPublicationById(id: string, category?: string, subcategory?: string, subsubcategory?: string) {
        try {
            // Construir query params
            const params = new URLSearchParams();
            if (category) {
                params.append('category', category);
            }
            if (subcategory) {
                params.append('subcategory', subcategory);
            }
            if (subsubcategory) {
                params.append('subsubcategory', subsubcategory);
            }
            
            // Fetch from API
            const queryString = params.toString() ? `?${params.toString()}` : '';
            const endpoint = `${this.ENDPOINTS.PUBLICATION(id)}${queryString}`;
            
            console.log(`Fetching publication from: ${endpoint}`);
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching publication ${id}:`, error);
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