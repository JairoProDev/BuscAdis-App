import {
  JobsIcon,
  RealEstateIcon,
  VehicleIcon,
  ServicesIcon,
  ProductsIcon,
  EventsIcon,
  EducationIcon,
  TourismIcon,
  PetsIcon
} from '@/components/icons/categories'
import { Category } from '@/types/marketplace'

export const categories: Category[] = [
  {
    id: 'empleos',
    name: 'Empleos',
    icon: JobsIcon,
    count: 1234,
    color: 'from-indigo-600 to-violet-600',
    types: [
      { id: 'tecnologia', name: 'Tecnología', emoji: '💻', count: 456 },
      { id: 'administracion', name: 'Administración', emoji: '📊', count: 234 },
      { id: 'ventas', name: 'Ventas', emoji: '💼', count: 345 },
      { id: 'salud', name: 'Salud', emoji: '⚕️', count: 123 },
      { id: 'educacion', name: 'Educación', emoji: '📚', count: 89 },
      { id: 'construccion', name: 'Construcción', emoji: '🏗️', count: 167 },
      { id: 'otros', name: 'Otros', emoji: '🔧', count: 432 }
    ]
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    icon: RealEstateIcon,
    count: 567,
    color: 'from-emerald-600 to-emerald-700',
    types: [
      { id: 'habitaciones', name: 'Habitaciones', emoji: '🛏️', count: 234 },
      { id: 'apartamentos', name: 'Apartamentos', emoji: '🏢', count: 345 },
      { id: 'casas', name: 'Casas', emoji: '🏠', count: 456 },
      { id: 'terrenos', name: 'Terrenos', emoji: '🏞️', count: 123 },
      { id: 'oficinas', name: 'Oficinas', emoji: '🏢', count: 89 },
      { id: 'locales', name: 'Locales', emoji: '🏪', count: 167 },
      { id: 'edificios', name: 'Edificios', emoji: '🏗️', count: 78 }
    ]
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    icon: VehicleIcon,
    count: 789,
    color: 'from-amber-500 to-amber-700',
    types: [
      { id: 'autos', name: 'Autos', emoji: '🚗', count: 432 },
      { id: 'motos', name: 'Motos', emoji: '🏍️', count: 234 },
      { id: 'camiones', name: 'Camiones', emoji: '🚛', count: 123 },
      { id: 'bicicletas', name: 'Bicicletas', emoji: '🚲', count: 167 },
      { id: 'repuestos', name: 'Repuestos', emoji: '🔧', count: 345 },
      { id: 'accesorios', name: 'Accesorios', emoji: '🎮', count: 234 }
    ]
  },
  {
    id: 'servicios',
    name: 'Servicios',
    icon: ServicesIcon,
    count: 456,
    color: 'from-pink-600 to-pink-800',
    types: [
      { id: 'limpieza', name: 'Limpieza', emoji: '🧹', count: 123 },
      { id: 'mantenimiento', name: 'Mantenimiento', emoji: '🔧', count: 234 },
      { id: 'transporte', name: 'Transporte', emoji: '🚚', count: 167 },
      { id: 'belleza', name: 'Belleza', emoji: '💅', count: 89 },
      { id: 'tecnologia', name: 'Tecnología', emoji: '💻', count: 145 },
      { id: 'legal', name: 'Legal', emoji: '⚖️', count: 78 }
    ]
  },
  {
    id: 'productos',
    name: 'Productos',
    icon: ProductsIcon,
    count: 890,
    color: 'from-blue-600 to-blue-800',
    types: [
      { id: 'electronica', name: 'Electrónica', emoji: '📱', count: 345 },
      { id: 'hogar', name: 'Hogar', emoji: '🏠', count: 234 },
      { id: 'ropa', name: 'Ropa', emoji: '👕', count: 456 },
      { id: 'deportes', name: 'Deportes', emoji: '⚽', count: 167 },
      { id: 'juguetes', name: 'Juguetes', emoji: '🎮', count: 123 },
      { id: 'libros', name: 'Libros', emoji: '📚', count: 89 }
    ]
  },
  {
    id: 'eventos',
    name: 'Eventos',
    icon: EventsIcon,
    count: 234,
    color: 'from-pink-500 to-pink-700',
    types: [
      { id: 'fiestas', name: 'Fiestas', emoji: '🎉', count: 89 },
      { id: 'conciertos', name: 'Conciertos', emoji: '🎸', count: 67 },
      { id: 'conferencias', name: 'Conferencias', emoji: '🎤', count: 45 },
      { id: 'deportivos', name: 'Deportivos', emoji: '🏆', count: 56 },
      { id: 'culturales', name: 'Culturales', emoji: '🎭', count: 34 }
    ]
  },
  {
    id: 'educacion',
    name: 'Educación',
    icon: EducationIcon,
    count: 345,
    color: 'from-violet-600 to-violet-800',
    types: [
      { id: 'cursos', name: 'Cursos', emoji: '📚', count: 167 },
      { id: 'tutoria', name: 'Tutoría', emoji: '👨‍🏫', count: 89 },
      { id: 'idiomas', name: 'Idiomas', emoji: '🌎', count: 123 },
      { id: 'musica', name: 'Música', emoji: '🎵', count: 78 },
      { id: 'arte', name: 'Arte', emoji: '🎨', count: 56 }
    ]
  },
  {
    id: 'turismo',
    name: 'Turismo',
    icon: TourismIcon,
    count: 123,
    color: 'from-cyan-600 to-cyan-800',
    types: [
      { id: 'hoteles', name: 'Hoteles', emoji: '🏨', count: 45 },
      { id: 'tours', name: 'Tours', emoji: '🗺️', count: 34 },
      { id: 'aventura', name: 'Aventura', emoji: '🏔️', count: 23 },
      { id: 'gastronomia', name: 'Gastronomía', emoji: '🍽️', count: 56 },
      { id: 'transporte', name: 'Transporte', emoji: '✈️', count: 34 }
    ]
  },
  {
    id: 'mascotas',
    name: 'Mascotas',
    icon: PetsIcon,
    count: 456,
    color: 'from-orange-600 to-orange-800',
    types: [
      { id: 'perros', name: 'Perros', emoji: '🐕', count: 234 },
      { id: 'gatos', name: 'Gatos', emoji: '🐈', count: 167 },
      { id: 'accesorios', name: 'Accesorios', emoji: '🦴', count: 123 },
      { id: 'servicios', name: 'Servicios', emoji: '✂️', count: 89 },
      { id: 'otros', name: 'Otros', emoji: '🐾', count: 78 }
    ]
  }
] 