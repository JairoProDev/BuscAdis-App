import axios from 'axios';
import { CategoryOption, Location, MediaFile, PriceInfo } from '@/types/publish';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface QuickListingData {
  title: string;
  description: string;
  category?: CategoryOption;
  type?: string;
  contact: {
    whatsapp?: string;
  };
  media?: File[];
  location?: Location;
  price?: PriceInfo;
}

export class ListingsService {
  static async createQuick(data: QuickListingData): Promise<{ id: string }> {
    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.type) formData.append('type', data.type);
      if (data.category) formData.append('category', JSON.stringify(data.category));
      if (data.contact.whatsapp) formData.append('whatsapp', data.contact.whatsapp);
      if (data.location) formData.append('location', JSON.stringify(data.location));
      if (data.price) formData.append('price', JSON.stringify(data.price));

      // Add media files
      if (data.media) {
        data.media.forEach((file, index) => {
          formData.append(`media[${index}]`, file);
        });
      }

      const response = await fetch(API_URL + '/quick', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el anuncio');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  static async getListings(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${API_URL}/listings`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  static async getListing(id: string) {
    try {
      const response = await axios.get(`${API_URL}/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw error;
    }
  }
} 