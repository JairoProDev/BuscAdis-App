import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudinaryService, CloudinaryUploadResult } from '@/services/cloudinary.service';
import { XCircleIcon, PhotoIcon, ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/components/ui/spinner';
import { Logger } from '@/services/logging.service';

export interface ImageUploaderProps {
  onImagesUploaded: (images: CloudinaryUploadResult[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
  showPreview?: boolean;
  className?: string;
  accept?: string;
  folder?: string;
  tags?: string[];
}

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
};

export function ImageUploader({
  onImagesUploaded,
  maxImages = 5,
  maxSizeInMB = MAX_SIZE_MB,
  showPreview = true,
  className = '',
  accept = ACCEPTED_TYPES,
  folder,
  tags
}: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<CloudinaryUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Convertir MB a bytes para validación
  const maxSizeBytes = maxSizeInMB * 1024 * 1024;
  
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validar si ya se alcanzó el máximo de imágenes
      if (uploadedImages.length + acceptedFiles.length > maxImages) {
        setUploadError(`No puedes subir más de ${maxImages} imágenes`);
        return;
      }
      
      // Validar tamaño y tipo de archivos
      const invalidFiles = acceptedFiles.filter(file => file.size > maxSizeBytes);
      if (invalidFiles.length > 0) {
        setUploadError(`Algunos archivos exceden el tamaño máximo de ${maxSizeInMB}MB`);
        return;
      }
      
      setIsUploading(true);
      setUploadError(null);
      
      try {
        Logger.info('Iniciando carga de imágenes', { count: acceptedFiles.length });
        
        // Cargar imágenes a Cloudinary
        const options = { folder, tags };
        const results = await CloudinaryService.uploadMultipleImages(acceptedFiles, options);
        
        // Actualizar estado y notificar al componente padre
        setUploadedImages(prev => [...prev, ...results]);
        onImagesUploaded([...uploadedImages, ...results]);
        
        Logger.success('Imágenes cargadas exitosamente', { count: results.length });
      } catch (error) {
        Logger.error('Error al cargar imágenes', { error });
        setUploadError('Error al subir las imágenes. Por favor, intenta nuevamente.');
      } finally {
        setIsUploading(false);
      }
    },
    [uploadedImages, maxImages, maxSizeBytes, maxSizeInMB, onImagesUploaded, folder, tags]
  );
  
  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      onImagesUploaded(newImages);
      return newImages;
    });
  };
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeBytes,
    disabled: isUploading || uploadedImages.length >= maxImages
  });
  
  return (
    <div className={`w-full ${className}`}>
      {/* Área de arrastrar y soltar */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploadedImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Spinner size="md" />
            <p className="mt-2 text-sm text-gray-500">Subiendo imágenes...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            {uploadedImages.length >= maxImages ? (
              <>
                <CheckCircleIcon className="w-10 h-10 text-primary-500 mb-2" />
                <p className="text-sm text-gray-500">Límite de imágenes alcanzado</p>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <ArrowUpTrayIcon className="w-10 h-10 text-primary-500 mb-2" />
                ) : (
                  <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                )}
                <p className="text-sm font-medium">
                  {isDragActive
                    ? 'Suelta las imágenes aquí'
                    : 'Arrastra imágenes o haz clic para seleccionar'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG o WEBP (máx. {maxSizeInMB}MB)
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {uploadedImages.length}/{maxImages} imágenes
                </p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Mensaje de error */}
      {uploadError && (
        <div className="mt-2 text-sm text-red-600">
          {uploadError}
        </div>
      )}
      
      {/* Previsualización de imágenes */}
      {showPreview && uploadedImages.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Imágenes cargadas:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {uploadedImages.map((image, index) => (
              <div key={image.publicId} className="relative group">
                <img
                  src={image.secureUrl}
                  alt={`Uploaded ${index + 1}`}
                  className="h-24 w-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-70 hover:opacity-100"
                  aria-label={`Eliminar imagen ${index + 1}`}
                  title="Eliminar imagen"
                >
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 