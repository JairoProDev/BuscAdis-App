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
 * @returns URL SEO-friendly
 */
export function generateSeoUrl(
  id: string,
  title: string,
  category?: string,
  subcategory?: string,
  subsubcategory?: string
): string {
  // Genera un slug del título
  const titleSlug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\sáéíóúñ]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  // Construir la URL con el formato /category/subcategory/subsubcategory/id/title
  let url = '';
  
  // Categoría (requerida)
  if (category) {
    url += `/${category}`;
    
    // Subcategoría (opcional)
    if (subcategory) {
      url += `/${subcategory}`;
      
      // Subsubcategoría (opcional)
      if (subsubcategory) {
        url += `/${subsubcategory}`;
      }
    }
    
    // ID (requerido)
    url += `/${id}`;
    
    // Título (opcional como parte de la URL)
    if (title) {
      url += `/${titleSlug}`;
    }
  } else {
    // Fallback si no hay categoría
    url = `/${id}/${titleSlug}`;
  }
  
  return url;
}

/**
 * Limpia un string para usarlo como slug en URLs
 * @param text - Texto a convertir en slug
 * @returns Texto limpio para URL
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\sáéíóúñ]/gi, '')
    .replace(/\s+/g, '-')
    .trim();
} 