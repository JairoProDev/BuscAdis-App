import axios from 'axios';
import { CategoryOption } from '@/types/categories';
import { Location, MediaFile, PriceInfo } from '@/types/publish';
import { API_URL } from '@/config/constants'
import { supabase } from '../supabaseClient';

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
  media: ImageDto[];
  location?: {
    district: {
      id: string;
      name: string;
    };
    region: {
      id: string;
      name: string;
    };
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  price?: {
    amount: number;
    currency: string;
    type: string;
  };
  priceType?: string;
}

export class ListingsService {
  static async createQuick(data: QuickListingData) {
    try {
      const { data: listing, error } = await supabase
        .from('listings')
        .insert([
          {
            title: data.title,
            description: data.description,
            type: data.type,
            price: data.price,
            price_type: data.priceType,
            contact: data.contact,
            location: data.location,
            is_active: true,
          },
        ]);

      if (error) throw new Error(error.message);
      return listing;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error('Error al crear el anuncio');
    }
  }

  static async getListings(page = 1, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  static async getListing(id: string) {
    try {
      const response = await fetch(`${API_URL}/listings/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener el anuncio');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw error;
    }
  }
} 