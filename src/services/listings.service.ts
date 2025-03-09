import axios from 'axios';
import { CategoryOption } from '@/types/categories';
import { Location, MediaFile, PriceInfo } from '@/types/publish';
import { API_URL } from '@/config/constants'
import { supabase } from '@/lib/supabaseClient';

export interface QuickListingData {
  title: string;
  description: string;
  category?: {
    id: string;
    name: string;
    subcategories?: Array<{
      id: string;
      name: string;
      selected?: boolean;
    }>;
  };
  type?: string;
  contact: {
    whatsapp: string;
  };
  media: any[];
  location?: {
    district?: {
      id: string;
      name: string;
    };
    region?: {
      id: string;
      name: string;
    };
    coordinates?: {
      lat: number;
      lon: number;
    };
    city?: string;
    country?: string;
  };
  price?: {
    amount: number;
    currency: string;
    type: string;
  };
  priceType?: string;
}

export class ListingsService {
  static async createListing(data) {
    try {
      // Validar datos requeridos
      if (!data.title || !data.description) {
        throw new Error('El título y la descripción son obligatorios');
      }

      // Crear el listado
      const { data: listing, error } = await supabase
        .from('listings')
        .insert([
          {
            title: data.title,
            description: data.description,
            price: data.price?.amount || 0,
            price_type: data.price?.type || 'fixed',
            category: data.category?.id || 'otros',
            location: {
              city: data.location?.city || '',
              region: data.location?.region?.name || '',
              coordinates: data.location?.coordinates || null
            },
            contact: {
              whatsapp: data.contact?.whatsapp || '',
              email: data.contact?.email || ''
            },
            media: data.media || [],
            is_active: true,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;
      return listing[0];
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  static async getListings(options = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      priceMin,
      priceMax,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    try {
      let query = supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Aplicar filtros
      if (category) {
        query = query.eq('category', category.toLowerCase());
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (priceMin !== undefined) {
        query = query.gte('price', priceMin);
      }

      if (priceMax !== undefined) {
        query = query.lte('price', priceMax);
      }

      // Aplicar ordenamiento
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Aplicar paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        listings: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  static async getListing(id) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching listing ${id}:`, error);
      throw error;
    }
  }

  static async updateListing(id, updates) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error updating listing ${id}:`, error);
      throw error;
    }
  }

  static async deleteListing(id) {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting listing ${id}:`, error);
      throw error;
    }
  }

  static async getListingsByCategory(categoryId, page = 1, limit = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .eq('type', categoryId.toLowerCase())
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) throw new Error(error.message);
      
      return {
        listings: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1
      };
    } catch (error) {
      console.error(`Error fetching listings for category ${categoryId}:`, error);
      return { listings: [], totalCount: 0, hasMore: false };
    }
  }

  static async getFeaturedListings(limit = 6) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(limit);
        
      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Error fetching featured listings:', error);
      return [];
    }
  }

  static async getRecentListings(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw new Error(error.message);
      return data || [];
    } catch (error) {
      console.error('Error fetching recent listings:', error);
      return [];
    }
  }

  static async searchListings(params = {}) {
    try {
      const { 
        query = '', 
        category = null,
        type = null,
        minPrice = null,
        maxPrice = null,
        location = null,
        page = 1,
        limit = 10
      } = params;

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      let queryBuilder = supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (category) {
        queryBuilder = queryBuilder.eq('type', category);
      }

      if (type) {
        queryBuilder = queryBuilder.eq('sub_type', type);
      }

      if (minPrice !== null) {
        queryBuilder = queryBuilder.gte('price', minPrice);
      }

      if (maxPrice !== null) {
        queryBuilder = queryBuilder.lte('price', maxPrice);
      }

      if (location) {
        queryBuilder = queryBuilder.or(`location->city.ilike.%${location}%,location->country.ilike.%${location}%`);
      }

      queryBuilder = queryBuilder
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await queryBuilder;
      
      if (error) throw error;
      
      return {
        listings: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error searching listings:', error);
      throw new Error(error instanceof Error ? error.message : 'Error al buscar anuncios');
    }
  }
} 