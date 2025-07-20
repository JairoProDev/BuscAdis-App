/**
 * Servicio para el manejo de imágenes
 * Actualmente deshabilitado - requiere configuración de Cloudinary
 */

import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '@/features/auth/services/auth.service';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageValidationRules {
  maxSizeInMB?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  allowedTypes?: string[];
}

export interface ProcessedImage {
  file: File;
  preview: string;
  size: number;
  width?: number;
  height?: number;
  type?: string;
}

interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
}


export class ImageService {
  // Servicio deshabilitado - requiere configuración
  private static readonly SERVICE_DISABLED = true;
  private static readonly BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  private static readonly CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;

  private static defaultRules: ImageValidationRules = {
    maxSizeInMB: 5,
    minWidth: 800,
    minHeight: 600,
    maxWidth: 4096,
    maxHeight: 4096,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  };

  static async getUploadUrl() {
    if (this.SERVICE_DISABLED) {
      throw new Error('Servicio de imágenes deshabilitado. Configure Cloudinary.');
    }

    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const key = `${currentUser.id}/${uuidv4()}`;
      
      const signedUrl = null; // Placeholder
      
      // Construir la URL de CloudFront para la imagen
      const imageUrl = this.CLOUDFRONT_DOMAIN 
        ? `https://${this.CLOUDFRONT_DOMAIN}/${key}`
        : undefined;
      
      return {
        uploadUrl: signedUrl,
        key,
        imageUrl
      };
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  }

  static async uploadImage(file: File) {
    if (this.SERVICE_DISABLED) {
      throw new Error('Servicio de imágenes deshabilitado. Configure Cloudinary.');
    }

    try {
      // Validar tamaño y tipo
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        throw new Error(`La imagen es demasiado grande. El tamaño máximo es 5MB.`);
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error(`El archivo no es una imagen válida.`);
      }
      
      // Obtener URL presignada
      const { uploadUrl, imageUrl, key } = await this.getUploadUrl();

      // Subir la imagen directamente a S3 usando la URL presignada
      if (!uploadUrl) {
        throw new Error('URL de subida no disponible');
      }
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir imagen');
      }

      return { imageUrl, key };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  static async deleteImage(key: string) {
    if (this.SERVICE_DISABLED) {
      throw new Error('Servicio de imágenes deshabilitado. Configure Cloudinary.');
    }

    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }
      
      // Verificar que la imagen pertenece al usuario
      if (!key.startsWith(`${currentUser.id}/`)) {
        throw new Error('No tienes permiso para eliminar esta imagen');
      }

      
      // await client.send(command); // Deshabilitado
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  static async validateImage(file: File): Promise<ImageValidationResult> {
    const errors: string[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`El tipo de archivo ${file.type} no está permitido. Usa PNG, JPG o WebP.`);
    }
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`La imagen es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). El tamaño máximo es 5MB.`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async processImage(file: File): Promise<ProcessedImage> {
    return new Promise((resolve) => {
      const preview = URL.createObjectURL(file);
      
      // Create a sample processed image
      const processedImage: ProcessedImage = {
        file,
        preview,
        size: file.size,
        type: file.type
      };
      
      resolve(processedImage);
    });
  }

  static async optimizeImage(file: File): Promise<File> {
    // Placeholder para optimización de imagen
    return file;
  }

  private static async getImageDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => {
        reject(new Error('No se pudieron obtener las dimensiones de la imagen'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static async createPreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  private static async createImageBitmap(file: File): Promise<ImageBitmap> {
    return createImageBitmap(file);
  }

  static revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }
}
