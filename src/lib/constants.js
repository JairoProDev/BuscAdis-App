/**
 * src/lib/constants.js
 * Constantes utilizadas en la aplicación de Buscadis
 */

import {
  BriefcaseIcon,
  HomeIcon,
  TruckIcon,
  WrenchIcon,
  ShoppingBagIcon,
  GlobeAltIcon,
  CalendarIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

// Categorías de la plataforma con sus datos
export const categories = [
  {
    id: 'empleos',
    name: 'Empleos',
    slug: 'empleos',
    description: 'Encuentra trabajos o publica ofertas laborales en toda la región.',
    icon: BriefcaseIcon,
    iconName: 'BriefcaseIcon',
    gradient: 'from-blue-500 to-blue-700',
    imageUrl: '/images/empleo-dev.jpg',
    count: 163
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    slug: 'inmuebles',
    description: 'Casas, departamentos, terrenos y locales comerciales en venta o alquiler.',
    icon: HomeIcon,
    iconName: 'HomeIcon',
    gradient: 'from-green-500 to-green-700',
    imageUrl: '/images/departamento-miraflores.jpg',
    count: 257
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    slug: 'vehiculos',
    description: 'Autos, motos, camionetas y más vehículos nuevos y usados.',
    icon: TruckIcon,
    iconName: 'TruckIcon',
    gradient: 'from-red-500 to-red-700',
    imageUrl: '/images/vehiculo-corolla.jpg',
    count: 184
  },
  {
    id: 'servicios',
    name: 'Servicios',
    slug: 'servicios',
    description: 'Profesionales y técnicos que ofrecen servicios de calidad.',
    icon: WrenchIcon,
    iconName: 'WrenchIcon',
    gradient: 'from-purple-500 to-purple-700',
    imageUrl: '/images/servicio-clases.jpg',
    count: 209
  },
  {
    id: 'productos',
    name: 'Productos',
    slug: 'productos',
    description: 'Compra y venta de todo tipo de productos nuevos o de segunda mano.',
    icon: ShoppingBagIcon,
    iconName: 'ShoppingBagIcon',
    gradient: 'from-orange-500 to-orange-700',
    imageUrl: '/images/producto-laptop.jpg',
    count: 318
  },
  {
    id: 'turismo',
    name: 'Turismo',
    slug: 'turismo',
    description: 'Tours, hoteles, restaurantes y experiencias turísticas.',
    icon: GlobeAltIcon,
    iconName: 'GlobeAltIcon',
    gradient: 'from-cyan-500 to-cyan-700',
    imageUrl: '/images/turismo-machupicchu.jpg',
    count: 125
  },
  {
    id: 'eventos',
    name: 'Eventos',
    slug: 'eventos',
    description: 'Conciertos, talleres, conferencias y todo tipo de eventos.',
    icon: CalendarIcon,
    iconName: 'CalendarIcon',
    gradient: 'from-pink-500 to-pink-700',
    imageUrl: '/images/evento-concierto.jpg',
    count: 73
  },
  {
    id: 'educacion',
    name: 'Educación',
    slug: 'educacion',
    description: 'Cursos, talleres, clases particulares y material educativo.',
    icon: AcademicCapIcon,
    iconName: 'AcademicCapIcon',
    gradient: 'from-indigo-500 to-indigo-700',
    imageUrl: '/images/educacion-marketing.jpg',
    count: 95
  }
]; 