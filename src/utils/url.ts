/**
 * Utilidades para la generación y manejo de URLs
 */

/**
 * Genera una URL SEO-friendly para una publicación
 * @param id - ID de la publicación
 * @param title - Título de la publicación
 * @param category - Categoría de la publicación (opcional)
 * @param subcategory - Subcategoría de la publicación (opcional)
 * @param subsubcategory - Sub-subcategoría de la publicación (opcional)
 * @param includeTitle - Incluir el slug del título en la URL (opcional, por defecto false)
 * @returns URL SEO-friendly
 */
export function generateSeoUrl(
  id: string,
  title: string,
  category?: string,
  subcategory?: string | null,
  subsubcategory?: string | null,
  includeTitle: boolean = false
): string {
  // Si el ID es null o undefined, usar un valor por defecto
  if (!id) {
    console.warn('generateSeoUrl: ID is null or undefined');
    id = 'unknown';
  }

  // Asegurarse de que el ID esté en formato numérico simple
  // Si el ID no es secuencial y tiene letras/caracteres, conservar su valor original
  const numericId = /^\d+$/.test(id) ? id : id;
  
  // Genera un slug del título
  const titleSlug = title
    ? title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\sáéíóúñ]/gi, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
    : 'detalle';
  
  // Verificar que todas las categorías estén normalizadas
  const normalizedCategory = category ? slugify(category) : '';
  const normalizedSubcategory = subcategory ? slugify(subcategory) : null;
  const normalizedSubsubcategory = subsubcategory ? slugify(subsubcategory) : null;
  
  // Construir la URL con el formato /category/subcategory/subsubcategory/id/title
  let url = '';
  
  // Categoría (requerida si está disponible)
  if (normalizedCategory) {
    url += `/${normalizedCategory}`;
    
    // Subcategoría (opcional) - solo incluir si tiene valor válido
    if (normalizedSubcategory && normalizedSubcategory !== 'unknown' && normalizedSubcategory !== 'null') {
      url += `/${normalizedSubcategory}`;
      
      // Subsubcategoría (opcional) - solo incluir si tiene valor válido
      if (normalizedSubsubcategory && normalizedSubsubcategory !== 'unknown' && normalizedSubsubcategory !== 'null') {
        url += `/${normalizedSubsubcategory}`;
      }
    }
    
    // Siempre incluir el ID después de la categoría (y subcategorías si existen)
    url += `/${numericId}`;
    
    // Título (opcional como parte de la URL, controlado por includeTitle)
    if (includeTitle && title) {
      url += `/${titleSlug}`;
    }
  } else {
    // Fallback si no hay categoría
    url = `/publicaciones/${numericId}`;
    if (title && includeTitle) {
      url += `/${titleSlug}`;
    }
  }
  
  // Agregar logging para depuración
  console.log(`URL generada: ${url} para ID: ${id}, categoría: ${category}, subcategoría: ${subcategory}, subsubcategoría: ${subsubcategory}`);
  
  return url;
}

/**
 * Limpia un string para usarlo como slug en URLs
 * @param text - Texto a convertir en slug
 * @returns Texto limpio para URL
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\sáéíóúñ]/gi, '')
    .replace(/\s+/g, '-')
    .trim();
} 