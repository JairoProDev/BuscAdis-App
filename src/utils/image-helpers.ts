/**
 * Utilidades para el manejo de imágenes en la aplicación
 * Estas funciones facilitan la manipulación y validación de imágenes
 */

/**
 * Obtiene las dimensiones (ancho y alto) de una imagen
 * @param file Archivo de imagen a analizar
 * @returns Promesa con las dimensiones de la imagen
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Liberar memoria revocando la URL del objeto
      URL.revokeObjectURL(img.src);
      resolve({
        width: img.width,
        height: img.height
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Error al cargar la imagen para obtener dimensiones'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convierte un archivo a Base64 para previsualizaciones
 * Útil para mostrar imágenes antes de subirlas
 * @param file Archivo a convertir
 * @returns Promesa con el string en Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Error al convertir archivo a Base64'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Valida que un archivo sea una imagen válida con las restricciones dadas
 * @param file Archivo a validar
 * @param options Opciones de validación
 * @returns Objeto con el resultado de la validación
 */
export const validateImage = async (
  file: File,
  options: {
    maxSizeInMB?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowedTypes?: string[];
  } = {}
): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  // Valores predeterminados
  const maxSizeInMB = options.maxSizeInMB || 5;
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
  
  // Validar tipo de archivo
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Formato de imagen no admitido. Utiliza: ${allowedTypes.map(t => t.replace('image/', '')).join(', ')}`);
  }
  
  // Validar tamaño máximo
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    errors.push(`La imagen excede el tamaño máximo de ${maxSizeInMB} MB`);
  }
  
  // Validar dimensiones si es necesario
  if (options.minWidth || options.minHeight || options.maxWidth || options.maxHeight) {
    try {
      const dimensions = await getImageDimensions(file);
      
      if (options.minWidth && dimensions.width < options.minWidth) {
        errors.push(`El ancho de la imagen (${dimensions.width}px) es menor que el mínimo requerido (${options.minWidth}px)`);
      }
      
      if (options.minHeight && dimensions.height < options.minHeight) {
        errors.push(`El alto de la imagen (${dimensions.height}px) es menor que el mínimo requerido (${options.minHeight}px)`);
      }
      
      if (options.maxWidth && dimensions.width > options.maxWidth) {
        errors.push(`El ancho de la imagen (${dimensions.width}px) es mayor que el máximo permitido (${options.maxWidth}px)`);
      }
      
      if (options.maxHeight && dimensions.height > options.maxHeight) {
        errors.push(`El alto de la imagen (${dimensions.height}px) es mayor que el máximo permitido (${options.maxHeight}px)`);
      }
    } catch {
      errors.push('No se pudieron determinar las dimensiones de la imagen');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Formatea el tamaño de un archivo en unidades legibles (KB, MB)
 * @param bytes Tamaño en bytes
 * @returns Cadena formateada con unidades
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

/**
 * Genera una URL de miniatura de Cloudinary con la transformación adecuada
 * @param url URL original de Cloudinary
 * @param width Ancho deseado
 * @param height Alto deseado
 * @returns URL transformada
 */
export const getCloudinaryThumbnail = (url: string, width: number = 300, height: number = 300): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Encontrar la parte de upload en la URL y agregar transformación
  return url.replace(/\/upload\//, `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
};

/**
 * Convierte una URL de imagen a un formato optimizado para listados
 * @param url URL de la imagen
 * @returns URL optimizada para listados
 */
export const getOptimizedImageUrl = (url: string): string => {
  if (!url) return '';
  
  if (url.includes('cloudinary.com')) {
    return getCloudinaryThumbnail(url, 400, 300);
  }
  
  // Si no es Cloudinary, devolver la URL original
  return url;
};

/**
 * Obtiene la ruta de la imagen predeterminada según la categoría
 * @param category Categoría de la publicación
 * @returns Ruta de la imagen predeterminada para esa categoría
 */
export const getDefaultImageByCategory = (category?: string): string => {
  if (!category) return '/images/placeholder/productos.jpg';
  
  const normalizedCategory = category.toLowerCase().trim();
  
  switch (normalizedCategory) {
    case 'empleos':
      return '/images/placeholder/empleos.jpg';
    case 'inmuebles':
      return '/images/placeholder/inmuebles.jpg';
    case 'vehiculos':
      return '/images/placeholder/vehiculos.jpg';
    case 'servicios':
      return '/images/placeholder/servicios.jpg';
    case 'eventos':
      return '/images/placeholder/eventos.jpg';
    case 'negocios':
      return '/images/placeholder/negocios.jpg';
    case 'comunidad':
      return '/images/placeholder/comunidad.jpg';
    case 'productos':
      return '/images/placeholder/productos.jpg';
    default:
      return '/images/placeholder/productos.jpg';
  }
}; 