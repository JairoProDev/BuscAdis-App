export type CategoryId = 
  | 'empleos'
  | 'inmuebles' 
  | 'vehiculos'
  | 'servicios'
  | 'productos'
  | 'eventos'
  | 'negocios'
  | 'comunidad'
  | 'turismo'
  | 'educacion'
  | 'mascotas'

// Tipos para cada categoría
export type InmuebleType = 
  | 'habitaciones'
  | 'apartamentos'
  | 'casas'
  | 'terrenos'
  | 'oficinas'
  | 'locales'
  | 'edificios'

export type EmpleoType =
  | 'tecnologia'
  | 'administracion'
  | 'ventas'
  | 'salud'
  | 'educacion'
  | 'construccion'
  | 'otros'

// ... (definir los tipos para las demás categorías)

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  iconName?: string;
  gradient?: string;
  imageUrl?: string;
  count?: number;
}

export interface Categories {
  [key: string]: Category;
}

export interface SubType {
  id: string
  name: string
  emoji: string
  count: number
}

export interface Adiso {
  id: string
  title: string
  price: number
  image: string
  location: string
  category: CategoryId
  subType: string
  isPremium: boolean
  isVerified: boolean
  rating: number
} 