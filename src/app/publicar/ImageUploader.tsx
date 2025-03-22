// ImageUploader.tsx
import React, { useState } from 'react';
// Importa tus utilidades de subida de imágenes

interface ImageUploaderProps {
  images: string[];
  onUpload: (images: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onUpload }) => {
  const [localImages, setLocalImages] = useState(images);

  const handleImageUpload = (files: File[]) => {
    // Lógica para subir imágenes y actualizar localImages
    // ...
    onUpload(localImages); // Llama a onUpload con las imágenes actualizadas
  };

  const handleRemoveImage = (index: number) => {
    // Lógica para eliminar una imagen y actualizar localImages
    // ...
    onUpload(localImages); // Llama a onUpload con las imágenes actualizadas
  };

  return (
    <div>
      {/* Componentes para subir y mostrar imágenes */}
    </div>
  );
};

export default ImageUploader;