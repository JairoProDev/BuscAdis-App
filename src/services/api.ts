import axios from 'axios';
import { Logger } from './logging.service';
import {
  Publication,
  PublicationFilters,
  PublicationResponse,
  PublicationImage,
} from '../types/publications';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Logger.error('Error en la solicitud API', { error });
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    Logger.debug('Respuesta API exitosa', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    Logger.error('Error en la respuesta API', {
      url: error.config?.url,
      status: error.response?.status,
      error: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Servicio para publicaciones
export const publicationService = {
  // Obtener publicaciones con filtros
  async getPublications(
    filters: PublicationFilters
  ): Promise<PublicationResponse> {
    try {
      const { data } = await api.get('/publications', { params: filters });
      return data;
    } catch (error) {
      Logger.error('Error al obtener publicaciones', { error, filters });
      throw error;
    }
  },

  // Obtener una publicación por ID
  async getPublication(id: string): Promise<Publication> {
    try {
      const { data } = await api.get(`/publications/${id}`);
      return data;
    } catch (error) {
      Logger.error('Error al obtener publicación', { error, id });
      throw error;
    }
  },

  // Crear una nueva publicación
  async createPublication(publication: Partial<Publication>): Promise<Publication> {
    try {
      const { data } = await api.post('/publications', publication);
      Logger.info('Publicación creada exitosamente', { id: data.id });
      return data;
    } catch (error) {
      Logger.error('Error al crear publicación', { error, publication });
      throw error;
    }
  },

  // Actualizar una publicación
  async updatePublication(
    id: string,
    updates: Partial<Publication>
  ): Promise<Publication> {
    try {
      const { data } = await api.put(`/publications/${id}`, updates);
      Logger.info('Publicación actualizada exitosamente', { id });
      return data;
    } catch (error) {
      Logger.error('Error al actualizar publicación', { error, id, updates });
      throw error;
    }
  },

  // Eliminar una publicación
  async deletePublication(id: string): Promise<void> {
    try {
      await api.delete(`/publications/${id}`);
      Logger.info('Publicación eliminada exitosamente', { id });
    } catch (error) {
      Logger.error('Error al eliminar publicación', { error, id });
      throw error;
    }
  },

  // Subir imágenes
  async uploadImages(files: File[]): Promise<PublicationImage[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const { data } = await api.post('/publications/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Logger.info('Imágenes subidas exitosamente', {
        count: files.length,
        images: data,
      });

      return data;
    } catch (error) {
      Logger.error('Error al subir imágenes', { error, files });
      throw error;
    }
  },

  // Buscar publicaciones por texto
  async searchPublications(query: string): Promise<Publication[]> {
    try {
      const { data } = await api.get('/publications/search', {
        params: { q: query },
      });
      return data;
    } catch (error) {
      Logger.error('Error al buscar publicaciones', { error, query });
      throw error;
    }
  },
};

// Servicio para categorías
export const categoryService = {
  // Obtener todas las categorías
  async getCategories() {
    try {
      const { data } = await api.get('/categories');
      return data;
    } catch (error) {
      Logger.error('Error al obtener categorías', { error });
      throw error;
    }
  },

  // Obtener subcategorías de una categoría
  async getSubcategories(categoryId: string) {
    try {
      const { data } = await api.get(`/categories/${categoryId}/subcategories`);
      return data;
    } catch (error) {
      Logger.error('Error al obtener subcategorías', { error, categoryId });
      throw error;
    }
  },

  // Obtener sub-subcategorías de una subcategoría
  async getSubSubcategories(subcategoryId: string) {
    try {
      const { data } = await api.get(
        `/subcategories/${subcategoryId}/subsubcategories`
      );
      return data;
    } catch (error) {
      Logger.error('Error al obtener sub-subcategorías', {
        error,
        subcategoryId,
      });
      throw error;
    }
  },
};

// Servicio para usuarios
export const userService = {
  // Obtener perfil del usuario actual
  async getCurrentUser() {
    try {
      const { data } = await api.get('/users/me');
      return data;
    } catch (error) {
      Logger.error('Error al obtener usuario actual', { error });
      throw error;
    }
  },

  // Obtener publicaciones del usuario actual
  async getUserPublications() {
    try {
      const { data } = await api.get('/users/me/publications');
      return data;
    } catch (error) {
      Logger.error('Error al obtener publicaciones del usuario', { error });
      throw error;
    }
  },

  // Actualizar perfil del usuario
  async updateProfile(updates: Partial<Record<string, unknown>>) {
    try {
      const { data } = await api.put('/users/me', updates);
      Logger.info('Perfil actualizado exitosamente');
      return data;
    } catch (error) {
      Logger.error('Error al actualizar perfil', { error, updates });
      throw error;
    }
  },
}; 