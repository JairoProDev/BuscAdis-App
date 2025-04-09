/**
 * Servicio de Cloudinary
 * Este servicio maneja la carga de imágenes a Cloudinary y proporciona
 * métodos para cargar imágenes desde archivos o desde URLs.
 */

import { Logger } from './logging.service';

// Tipos para las imágenes procesadas
export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  originalFilename: string;
  resourceType: string;
}

export interface CloudinaryOptions {
  folder?: string;
  transformation?: string[];
  tags?: string[];
  publicId?: string;
}

export class CloudinaryService {
  static cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  static uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'buscadis';

  /**
   * Carga una imagen a Cloudinary usando la API de upload
   * @param file Archivo a cargar
   * @param options Opciones de carga
   * @returns Resultado de la carga
   */
  static async uploadImage(file: File, options: CloudinaryOptions = {}): Promise<CloudinaryUploadResult> {
    try {
      Logger.info('Iniciando carga de imagen a Cloudinary', { filename: file.name, size: file.size });
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Añadir opciones si están presentes
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.tags?.length) {
        formData.append('tags', options.tags.join(','));
      }
      
      if (options.publicId) {
        formData.append('public_id', options.publicId);
      }
      
      // Usar la ruta de API interna
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al subir la imagen: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      // Transformar la respuesta de Cloudinary a nuestro formato
      const result: CloudinaryUploadResult = {
        publicId: data.public_id,
        url: data.url,
        secureUrl: data.secure_url,
        format: data.format,
        width: data.width,
        height: data.height,
        originalFilename: data.original_filename,
        resourceType: data.resource_type
      };
      
      Logger.info('Imagen cargada exitosamente a Cloudinary', { 
        publicId: result.publicId,
        url: result.secureUrl
      });
      
      return result;
    } catch (error) {
      Logger.error('Error al cargar imagen a Cloudinary', { error, filename: file.name });
      throw error;
    }
  }

  /**
   * Carga múltiples imágenes a Cloudinary en paralelo
   * @param files Array de archivos a cargar
   * @param options Opciones de carga
   * @returns Array con los resultados de cada carga
   */
  static async uploadMultipleImages(
    files: File[], 
    options: CloudinaryOptions = {}
  ): Promise<CloudinaryUploadResult[]> {
    try {
      Logger.info('Iniciando carga múltiple de imágenes', { count: files.length });
      
      const uploadPromises = files.map(file => this.uploadImage(file, options));
      return await Promise.all(uploadPromises);
    } catch (error) {
      Logger.error('Error al cargar múltiples imágenes', { error, fileCount: files.length });
      throw error;
    }
  }

  /**
   * Genera una URL de Cloudinary para una imagen ya cargada
   * @param publicId ID público de la imagen en Cloudinary
   * @param options Opciones de transformación
   * @returns URL completa de la imagen
   */
  static getImageUrl(publicId: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  } = {}): string {
    if (!publicId) return '';
    
    const transforms = [];
    
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.crop) transforms.push(`c_${options.crop}`);
    if (options.quality) transforms.push(`q_${options.quality}`);
    if (options.format) transforms.push(`f_${options.format}`);
    
    const transformString = transforms.length > 0 ? transforms.join(',') + '/' : '';
    
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformString}${publicId}`;
  }

  /**
   * Crea una versión optimizada de la URL para listados
   * @param publicId ID público de la imagen
   * @returns URL optimizada para listados
   */
  static getThumbnailUrl(publicId: string): string {
    return this.getImageUrl(publicId, {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 80
    });
  }

  /**
   * Crea una versión optimizada para vista detallada
   * @param publicId ID público de la imagen
   * @returns URL optimizada para vista detallada
   */
  static getDetailUrl(publicId: string): string {
    return this.getImageUrl(publicId, {
      width: 800,
      quality: 90
    });
  }
} 