import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '@/features/auth/services/auth.service';

export class ImageService {
  private static client = new S3Client({ region: process.env.NEXT_PUBLIC_AWS_REGION });
  private static BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  private static CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;

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
}
