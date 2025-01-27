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

export const categories = {
  'Empleos': {
    icon: BriefcaseIcon,
    description: 'Encuentra tu próxima oportunidad laboral',
    gradient: 'from-blue-500 to-blue-700',
    stats: ['1,234 ofertas', 'Actualizado hoy'],
  },
  'Inmuebles': {
    icon: HomeIcon,
    description: 'Propiedades en venta y alquiler',
    gradient: 'from-green-500 to-green-700',
    stats: ['856 propiedades', 'Cusco y alrededores'],
  },
  'Vehículos': {
    icon: TruckIcon,
    description: 'Autos, motos y más',
    gradient: 'from-red-500 to-red-700',
    stats: ['432 vehículos', 'Todas las marcas'],
  },
  'Servicios': {
    icon: WrenchIcon,
    description: 'Servicios profesionales',
    gradient: 'from-purple-500 to-purple-700',
    stats: ['978 servicios', 'Profesionales verificados'],
  },
  'Productos': {
    icon: ShoppingBagIcon,
    description: 'Artículos nuevos y usados',
    gradient: 'from-yellow-500 to-yellow-700',
    stats: ['2,345 productos', 'Envíos a todo Cusco'],
  },
  'Turismo': {
    icon: GlobeAltIcon,
    description: 'Alojamiento y experiencias',
    gradient: 'from-teal-500 to-teal-700',
    stats: ['543 experiencias', 'Tours guiados'],
  },
  'Eventos': {
    icon: CalendarIcon,
    description: 'Eventos y entretenimiento',
    gradient: 'from-pink-500 to-pink-700',
    stats: ['123 eventos', 'Este mes'],
  },
  'Educación': {
    icon: AcademicCapIcon,
    description: 'Cursos y formación',
    gradient: 'from-indigo-500 to-indigo-700',
    stats: ['765 cursos', 'Certificados'],
  },
  'Mascotas': {
    icon: HeartIcon,
    description: 'Animales y accesorios',
    gradient: 'from-orange-500 to-orange-700',
    stats: ['321 anuncios', 'Veterinarios certificados'],
  },
} as const; 