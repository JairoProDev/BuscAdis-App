'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface ImageUploadProps {
  maxFiles?: number;
  onImagesChange: (files: File[]) => void;
  initialImages?: string[];
}

export default function ImageUpload({
  maxFiles = 5,
  onImagesChange,
  initialImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Convertir archivos a URLs para preview
    const newImageUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newImageUrls].slice(0, maxFiles));
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, maxFiles));
    
    // Notificar al componente padre
    onImagesChange([...files, ...acceptedFiles].slice(0, maxFiles));
  }, [files, maxFiles, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles - images.length,
    disabled: images.length >= maxFiles
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newFiles = [...files];
    
    // Revocar URL del objeto
    URL.revokeObjectURL(images[index]);
    
    newImages.splice(index, 1);
    newFiles.splice(index, 1);
    
    setImages(newImages);
    setFiles(newFiles);
    onImagesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Área de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-500'
        } ${images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary-600">Suelta las imágenes aquí...</p>
        ) : (
          <p className="text-gray-600">
            {images.length >= maxFiles
              ? `Máximo ${maxFiles} imágenes`
              : 'Arrastra y suelta imágenes aquí, o haz clic para seleccionar'}
          </p>
        )}
      </div>

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={`image-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="relative aspect-square">
              <Image
                src={image}
                alt={`Imagen ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <XCircleIcon className="w-6 h-6 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
