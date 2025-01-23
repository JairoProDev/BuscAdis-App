import { IconType } from '@/types/icons'

export type CategoryId = 
  | 'empleos'
  | 'inmuebles' 
  | 'vehiculos'
  | 'servicios'
  | 'productos'
  | 'eventos'
  | 'educacion'
  | 'turismo'
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
  id: CategoryId
  name: string
  icon: IconType
  count: number
  color: string
  types: SubType[]
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