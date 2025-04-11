import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera una URL amigable para SEO a partir del título, categoría y subcategoría
 * @param title Título de la publicación
 * @param category Categoría de la publicación
 * @param subcategory Subcategoría opcional
 * @returns URL amigable para SEO
 */
export function generateSeoUrl(title: string, category: string, subcategory?: string): string {
  // Normalizar título (eliminar acentos, convertir a minúsculas y reemplazar caracteres especiales por guiones)
  const normalizedTitle = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Construir la URL con categoría y título
  let url = `/${category}`;
  
  // Añadir subcategoría si existe
  if (subcategory) {
    url += `/${subcategory}`;
  }
  
  // Añadir título normalizado
  url += `/${normalizedTitle}`;
  
  return url;
}
