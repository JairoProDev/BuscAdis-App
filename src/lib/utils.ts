import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera una URL amigable para SEO a partir del título, categoría y subcategoría
 * @param id ID único de la publicación 
 * @param title Título de la publicación
 * @param slug Slug pre-generado (opcional)
 * @param category Categoría de la publicación
 * @param subcategory Subcategoría opcional
 * @param subsubcategory Subsubcategoría opcional
 * @param generateFromTitle Indica si se debe generar el slug a partir del título
 * @returns URL amigable para SEO
 */
export function generateSeoUrl(
  id: string,
  title: string,
  slug?: string | null,
  category?: string,
  subcategory?: string | null,
  subsubcategory?: string | null,
  generateFromTitle = false
): string {
  // Si tenemos un slug pre-generado y no se pide generar desde el título, usarlo
  let normalizedSlug = slug && !generateFromTitle ? slug : '';
  
  // Si no hay slug o se pide regenerar, normalizar título
  if (!normalizedSlug || generateFromTitle) {
    normalizedSlug = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Construir la URL con categoría, subcategoría y título
  let url = '';
  
  // Añadir categoría si existe
  if (category) {
    url += `/${category}`;
    
    // Añadir subcategoría si existe
    if (subcategory) {
      url += `/${subcategory}`;
      
      // Añadir subsubcategoría si existe
      if (subsubcategory) {
        url += `/${subsubcategory}`;
      }
    }
  }
  
  // Añadir ID y slug
  if (normalizedSlug) {
    url += `/${id}/${normalizedSlug}`;
  } else {
    url += `/${id}`;
  }
  
  return url;
}
