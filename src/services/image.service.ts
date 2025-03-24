import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
  dimensions: ImageDimensions;
  size: number;
  type: string;
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

  static async getUploadUrl(contentType) {
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

  static async uploadImage(file) {
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

  static async deleteImage(key) {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }
      
      // Verificar que la imagen pertenece al usuario
      if (!key.startsWith(`${currentUser.id}/`)) {
        throw new Error('No tienes permiso para eliminar esta imagen');
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

  static async validateImage(
    file: File,
    rules: ImageValidationRules = {}
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const finalRules = { ...this.defaultRules, ...rules };
    const errors: string[] = [];

    // Validar tipo de archivo
    if (
      finalRules.allowedTypes &&
      !finalRules.allowedTypes.includes(file.type.toLowerCase())
    ) {
      errors.push(
        `Tipo de archivo no permitido. Tipos permitidos: ${finalRules.allowedTypes
          .map(type => type.split('/')[1].toUpperCase())
          .join(', ')}`
      );
      Logger.warn(`Tipo de archivo no permitido: ${file.type}`);
    }

    // Validar tamaño
    if (finalRules.maxSizeInMB) {
      const maxSizeInBytes = finalRules.maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        errors.push(`El archivo no debe superar los ${finalRules.maxSizeInMB}MB`);
        Logger.warn(`Archivo demasiado grande: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      }
    }

    try {
      // Validar dimensiones
      const dimensions = await this.getImageDimensions(file);

      if (finalRules.minWidth && dimensions.width < finalRules.minWidth) {
        errors.push(`El ancho mínimo debe ser ${finalRules.minWidth}px`);
        Logger.warn(`Ancho insuficiente: ${dimensions.width}px`);
      }

      if (finalRules.minHeight && dimensions.height < finalRules.minHeight) {
        errors.push(`El alto mínimo debe ser ${finalRules.minHeight}px`);
        Logger.warn(`Alto insuficiente: ${dimensions.height}px`);
      }

      if (finalRules.maxWidth && dimensions.width > finalRules.maxWidth) {
        errors.push(`El ancho máximo debe ser ${finalRules.maxWidth}px`);
        Logger.warn(`Ancho excesivo: ${dimensions.width}px`);
      }

      if (finalRules.maxHeight && dimensions.height > finalRules.maxHeight) {
        errors.push(`El alto máximo debe ser ${finalRules.maxHeight}px`);
        Logger.warn(`Alto excesivo: ${dimensions.height}px`);
      }

      if (finalRules.aspectRatio) {
        const currentRatio = dimensions.width / dimensions.height;
        const tolerance = 0.1; // 10% de tolerancia
        if (
          Math.abs(currentRatio - finalRules.aspectRatio) > tolerance
        ) {
          errors.push(`La relación de aspecto debe ser cercana a ${finalRules.aspectRatio}`);
          Logger.warn(`Relación de aspecto incorrecta: ${currentRatio.toFixed(2)}`);
        }
      }
    } catch (error) {
      errors.push('Error al procesar la imagen');
      Logger.error('Error al validar dimensiones de la imagen:', error);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async processImage(file: File): Promise<ProcessedImage> {
    try {
      const dimensions = await this.getImageDimensions(file);
      const preview = await this.createPreview(file);

      Logger.debug(`Imagen procesada: ${dimensions.width}x${dimensions.height}px, ${(file.size / 1024).toFixed(2)}KB`);

      return {
        file,
        preview,
        dimensions,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      Logger.error('Error al procesar la imagen:', error);
      throw new Error('Error al procesar la imagen');
    }
  }

  static async optimizeImage(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<File> {
    try {
      const image = await this.createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No se pudo crear el contexto del canvas');
      }

      let { width, height } = image;

      // Redimensionar si es necesario
      if (options.maxWidth && width > options.maxWidth) {
        const ratio = options.maxWidth / width;
        width = options.maxWidth;
        height = height * ratio;
      }

      if (options.maxHeight && height > options.maxHeight) {
        const ratio = options.maxHeight / height;
        height = options.maxHeight;
        width = width * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen en el canvas
      ctx.drawImage(image, 0, 0, width, height);

      // Convertir a blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b!),
          `image/${options.format || 'jpeg'}`,
          options.quality || 0.8
        );
      });

      const optimizedFile = new File(
        [blob],
        file.name.replace(/\.[^/.]+$/, `.${options.format || 'jpg'}`),
        {
          type: `image/${options.format || 'jpeg'}`
        }
      );

      Logger.success(`Imagen optimizada: ${(optimizedFile.size / 1024).toFixed(2)}KB`);
      return optimizedFile;
    } catch (error) {
      Logger.error('Error al optimizar la imagen:', error);
      throw new Error('Error al optimizar la imagen');
    }
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
      Logger.error('Error al crear ImageBitmap:', error);
      throw new Error('Error al procesar la imagen');
    }
  }

  static revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
    Logger.debug('URL de objeto revocada');
  }
}
