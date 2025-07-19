// Conditional AWS SDK imports
// Conditional AWS SDK imports
let S3Client: any = null;
let PutObjectCommand: any = null;
let DeleteObjectCommand: any = null;
let getSignedUrl: any = null;

try {
  // AWS SDK imports are now handled at the top
} catch (_error) {
  // AWS SDK not available, service will use fallback methods
}

import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '@/features/auth/services/auth.service';
import { Logger } from './logging.service';

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

interface OptimizationOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: string;
}

export class ImageService {
  private static client = new S3Client({ region: process.env.NEXT_PUBLIC_AWS_REGION });
  private static BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  private static CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;

  private static defaultRules: ImageValidationRules = {
    maxSizeInMB: 5,
    minWidth: 800,
    minHeight: 600,
    maxWidth: 4096,
    maxHeight: 4096,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  };

  static async getUploadUrl(contentType: string) {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const key = `${currentUser.id}/${uuidv4()}`;
      
      const command = new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
        ContentType: contentType
      });

      // Generar URL presignada que expira en 5 minutos
      const signedUrl = await getSignedUrl(this.client, command, { expiresIn: 300 });
      
      // Construir la URL de CloudFront para la imagen
      const imageUrl = this.CLOUDFRONT_DOMAIN 
        ? `https://${this.CLOUDFRONT_DOMAIN}/${key}`
        : `https://${this.BUCKET_NAME}.s3.amazonaws.com/${key}`;
      
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
    try {
      // Validar tamaño y tipo
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        throw new Error(`La imagen es demasiado grande. El tamaño máximo es 5MB.`);
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error(`El archivo no es una imagen válida.`);
      }
      
      // Obtener URL presignada
      const { uploadUrl, imageUrl, key } = await this.getUploadUrl(file.type);

      // Subir la imagen directamente a S3 usando la URL presignada
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
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }
      
      // Verificar que la imagen pertenece al usuario
      if (!key.startsWith(`${currentUser.id}/`)) {
        throw new Error('No tienes permiso para eliminar esta imagen');
      }
      
      if (!DeleteObjectCommand) {
        throw new Error('AWS SDK not available');
      }
      
      const command = new DeleteObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key
      });
      
      await this.client.send(command);
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

  static async optimizeImage(file: File, _options: OptimizationOptions): Promise<File> {
    // In a real implementation, this would resize and compress the image
    // For now, we'll just return the original file
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
        reject(new Error('Error al cargar la imagen'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static async createPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Error al crear la vista previa'));
      };
      reader.readAsDataURL(file);
    });
  }

  private static async createImageBitmap(file: File): Promise<ImageBitmap> {
    try {
      return await createImageBitmap(file);
    } catch (error) {
      Logger.error('Error al crear ImageBitmap:', error instanceof Error ? { message: error.message } : { error });
      throw new Error('Error al procesar la imagen');
    }
  }

  static revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
    Logger.debug('URL de objeto revocada');
  }
}
