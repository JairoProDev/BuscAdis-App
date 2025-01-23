export type AdisoType = 
  | 'Empleos'
  | 'Inmuebles' 
  | 'Vehículos'
  | 'Servicios'
  | 'Productos'
  | 'Eventos'
  | 'Educación'
  | 'Turismo'
  | 'Mascotas'

export interface Category {
  id: string
  name: string
  icon: IconType
  count: number
  color: string
  type: AdisoType
}

export interface Adiso {
  id: string
  title: string
  price: number
  image: string
  location: string
  category: Category
  isPremium: boolean
  isVerified: boolean
  rating: number
  type: AdisoType
} 