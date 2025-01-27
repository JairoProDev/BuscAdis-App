import axios from 'axios';
import { CategoryOption } from '@/types/categories';
import { Location, MediaFile, PriceInfo } from '@/types/publish';
import { API_URL } from '@/config/constants'

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
  media: File[];
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
}

export class ListingsService {
  static async createQuick(data: QuickListingData) {
    try {
      // Validaciones del lado del cliente
      if (!data.title || data.title.length < 5) {
        throw new Error('El título debe tener al menos 5 caracteres');
      }
      if (!data.description || data.description.length < 20) {
        throw new Error('La descripción debe tener al menos 20 caracteres');
      }
      if (!data.contact.whatsapp || !/^\d{9,}$/.test(data.contact.whatsapp)) {
        throw new Error('El número de WhatsApp debe tener al menos 9 dígitos');
      }
      if (!data.category || !data.category.subcategories?.some(sub => sub.selected)) {
        throw new Error('Debes seleccionar una categoría y subcategoría');
      }
      if (!data.location) {
        throw new Error('Debes seleccionar una ubicación');
      }
      if (!data.media || data.media.length === 0) {
        throw new Error('Debes subir al menos una imagen');
      }

      const formData = new FormData();
      
      // Append basic fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('contact', JSON.stringify(data.contact));
      
      // Append category and type
      if (data.category) {
        const selectedSubcategory = data.category.subcategories?.find(sub => sub.selected);
        formData.append('category', JSON.stringify({
          id: data.category.id,
          name: data.category.name,
          subcategory: selectedSubcategory ? {
            id: selectedSubcategory.id,
            name: selectedSubcategory.name
          } : undefined
        }));
      }
      if (data.type) {
        formData.append('type', data.type);
      }
      
      // Append location
      if (data.location) {
        formData.append('location', JSON.stringify(data.location));
      }
      
      // Append price
      if (data.price) {
        formData.append('price', JSON.stringify(data.price));
      }
      
      // Append media files
      if (data.media && data.media.length > 0) {
        data.media.forEach((file, index) => {
          formData.append(`media[${index}]`, file);
        });
      }

      const response = await fetch(`${API_URL}/listings/quick`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = 'Error al crear el anuncio';
        
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.message) {
            errorMessage = parsedError.message;
          } else if (parsedError.errors) {
            // Si hay múltiples errores, los concatenamos
            errorMessage = Object.values(parsedError.errors).join('\n');
          }
        } catch {
          // Si el error no es JSON, intentamos extraer un mensaje útil del HTML
          if (errorData.includes('<!DOCTYPE html>')) {
            errorMessage = 'Error de conexión con el servidor. Por favor intenta de nuevo.';
          } else if (errorData) {
            errorMessage = errorData;
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating listing:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Error inesperado al crear el anuncio. Por favor intenta de nuevo.');
    }
  }

  static async getListings(page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}/listings?page=${page}&limit=${limit}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener los anuncios');
      }
      
      return response.json();
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