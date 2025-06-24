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

// Estructura de datos para categorías
export interface MockCategory {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  types: {
    id: string;
    name: string;
    count?: number;
  }[];
}

// Datos de ejemplo para categorías
export const categories: MockCategory[] = [
  {
    id: "inmuebles",
    name: "Inmuebles",
    icon: "🏠",
    types: [
      { id: "casa", name: "Casa en venta", count: 230 },
      { id: "departamento", name: "Departamento en alquiler", count: 152 },
      { id: "terreno", name: "Terreno", count: 85 },
      { id: "oficina", name: "Oficina", count: 42 },
      { id: "local", name: "Local comercial", count: 38 }
    ]
  },
  {
    id: "vehiculos",
    name: "Vehículos",
    icon: "🚗",
    types: [
      { id: "auto", name: "Auto", count: 189 },
      { id: "camioneta", name: "Camioneta", count: 96 },
      { id: "moto", name: "Moto", count: 43 },
      { id: "repuestos", name: "Repuestos", count: 127 }
    ]
  },
  {
    id: "servicios",
    name: "Servicios",
    icon: "🛠️",
    badge: "Popular",
    types: [
      { id: "profesionales", name: "Servicios profesionales", count: 162 },
      { id: "hogar", name: "Servicios para el hogar", count: 84 },
      { id: "educacion", name: "Educación", count: 56 },
      { id: "salud", name: "Salud y belleza", count: 48 }
    ]
  },
  {
    id: "empleo",
    name: "Empleo",
    icon: "💼",
    types: [
      { id: "ofertas", name: "Ofertas de trabajo", count: 174 },
      { id: "cv", name: "Personas que buscan empleo", count: 95 }
    ]
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    icon: "📱",
    types: [
      { id: "celulares", name: "Celulares", count: 78 },
      { id: "computadoras", name: "Computadoras", count: 52 },
      { id: "accesorios", name: "Accesorios", count: 103 }
    ]
  },
  {
    id: "hogar",
    name: "Hogar",
    icon: "🛋️",
    types: [
      { id: "muebles", name: "Muebles", count: 65 },
      { id: "electrodomesticos", name: "Electrodomésticos", count: 48 },
      { id: "decoracion", name: "Decoración", count: 39 }
    ]
  },
  {
    id: "mascotas",
    name: "Mascotas",
    icon: "🐶",
    types: [
      { id: "adopcion", name: "Adopción", count: 24 },
      { id: "venta", name: "Venta de mascotas", count: 32 },
      { id: "accesorios", name: "Accesorios para mascotas", count: 41 }
    ]
  },
  {
    id: "deportes",
    name: "Deportes",
    icon: "⚽",
    types: [
      { id: "equipamiento", name: "Equipamiento deportivo", count: 56 },
      { id: "bicicletas", name: "Bicicletas", count: 34 },
      { id: "gimnasio", name: "Artículos de gimnasio", count: 29 }
    ]
  }
]; 