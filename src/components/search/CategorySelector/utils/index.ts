import { ElementType } from 'react';
import { Category, Subcategory, SubSubcategory } from '../types';
import {
  ComputerDesktopIcon,
  HomeIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ShoppingBagIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  HeartIcon,
  AcademicCapIcon,
  BeakerIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { categoriesList } from '@/data/categories-data';

// Mapeo de iconos por categoría (SOLO PARA CATEGORÍAS PRINCIPALES)
export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  // Las 8 categorías principales EXACTAMENTE como en categories-data.ts
  'empleos': BriefcaseIcon,
  'inmuebles': HomeIcon,
  'vehiculos': TruckIcon,
  'servicios': WrenchScrewdriverIcon,
  'productos': ShoppingBagIcon,
  'eventos': CalendarIcon,
  'negocios': BuildingStorefrontIcon,
  'comunidad': UserGroupIcon,
  
  // Valores por defecto
  'default': ShoppingBagIcon,
  'all': ShoppingBagIcon
};

// Colores para categorías (tailwind)
export const CATEGORY_COLORS: Record<string, string> = {
  'empleos': 'blue',
  'inmuebles': 'green',
  'vehiculos': 'red',
  'servicios': 'purple',
  'productos': 'orange',
  'eventos': 'pink',
  'negocios': 'yellow',
  'comunidad': 'teal',
  'default': 'gray',
  'all': 'gray'
};

// Mapeo de imágenes para categorías principales
export const CATEGORY_IMAGES: Record<string, string> = {
  // Valores actualizados utilizando las imágenes de /public/images/categories/
  'empleos': '/images/categories/empleos.jpg',
  'inmuebles': '/images/categories/inmuebles.jpg',
  'vehiculos': '/images/categories/vehiculos.jpg',
  'servicios': '/images/categories/servicios.jpg',
  'productos': '/images/categories/productos.jpg',
  'eventos': '/images/categories/eventos.jpg',
  'negocios': '/images/categories/negocios.jpg',
  'comunidad': '/images/categories/comunidad.jpg',
  'all': '/images/categories/default.jpg',
  'default': '/images/categories/default.jpg'
};

// Mapeo de emojis para sub-subcategorías (SOLO PARA SUBSUBCATEGORÍAS)
export const SUBSUBCATEGORY_EMOJIS: Record<string, string> = {
  // Empleos
  'asistente-administrativo': '📋',
  'secretario-recepcionista': '📝',
  'contador-auxiliar-contable': '🧮',
  'administrador-gerente': '👔',
  'recursos-humanos': '👥',
  'auditor': '🔍',
  'vendedor-ejecutivo-cuentas': '🤝',
  'promotor-impulsador': '📢',
  'atencion-cliente': '🎯',
  'cajero': '💰',
  'marketing-digital-community-manager': '📱',
  'telemarketing-call-center': '📞',
  'cocinero-chef': '👨‍🍳',
  'ayudante-cocina': '🍲',
  'mozo-azafata': '🍽️',
  'barman-barista': '🍸',
  'recepcionista-hotel': '🏨',
  'botones-bellboy': '🧳',
  'personal-limpieza-housekeeping': '🧹',
  'guia-turismo': '🧭',
  'agente-viajes-counter': '✈️',
  'operaciones-turisticas': '🗺️',
  'albanil-operario-construccion': '🧱',
  'pintor': '🖌️',
  'gasfitero-fontanero': '🚿',
  'electricista': '⚡',
  'carpintero-ebanista': '🪚',
  'soldador': '🔥',
  'jardinero': '🌱',
  'tecnico-mantenimiento-general': '🔧',
  'maestro-obra': '👷',
  'ing-arq-residente-asistente': '📐',
  
  // Inmuebles
  'estandar': '🏢',
  'duplex': '🏘️',
  'triplex': '🏙️',
  'penthouse': '🌆',
  'estudio-loft': '🏠',
  'simple-personal': '🛏️',
  'doble-matrimonial': '🛌',
  'compartida-estudiantes': '👨‍👩‍👧',
  'casa-urbana': '🏡',
  'casa-campo-quinta': '🌳',
  'chalet': '🏕️',
  'condominio': '🏘️',
  'terreno-urbano-residencial': '📍',
  'terreno-comercial': '🏪',
  'terreno-industrial': '🏭',
  'terreno-agricola-rural': '🌾',
  'lote-condominio': '🏞️',
  'terreno-playa-campo': '🏝️',
  'tienda-puerta-calle': '🛒',
  'stand-galeria-cc': '🛍️',
  'restaurante-bar-cafe': '☕',
  'consultorio-oficina-profesional': '💼',
  'local-industrial-taller': '🔨',
  'salon-eventos': '🎉',
  'mercado-puesto': '🛒',
  
  // Vehículos
  'sedan': '🚗',
  'hatchback': '🚙',
  'coupe': '🏎️',
  'convertible': '🚘',
  'station-wagon': '🚐',
  'suv': '🚵',
  'pickup': '🛻',
  'van-pasajeros': '🚐',
  'furgoneta-carga': '🚚',
  'moto-lineal-pistera': '🏍️',
  'scooter': '🛵',
  'motocross-enduro-todoterreno': '🏔️',
  'mototaxi-trimoto': '🛺',
  'cuatrimoto': '🏆',
  'camion-ligero-mediano': '🚛',
  'camion-pesado-volquete-cisterna': '🚒',
  'remolcador-tracto': '🚜',
  'bus-interprovincial-turistico': '🚍',
  'minibus-custer-combi': '🚌',
  
  // Servicios
  'legales-abogados': '⚖️',
  'contables-tributarios-auditoria': '📊',
  'ingenieria-arquitectura-proyectos': '📐',
  'consultoria-negocios': '💼',
  'diseno-publicidad-marketing': '🎨',
  'traduccion-interpretacion': '🗣️',
  'servicios-informaticos-ti': '💻',
  'topografia-geodesia': '🌐',
  'reparacion-electrodomesticos': '🔌',
  'reparacion-computadoras-laptops': '🖥️',
  'reparacion-celulares-tablets': '📱',
  'mecanica-automotriz-motos': '🔩',
  'planchado-pintura-vehicular': '🎨',
  'gasfiteria-plomeria': '🚿',
  'electricidad-instalaciones': '💡',
  'cerrajeria': '🔑',
  'construccion-remodelacion-albanileria': '🏗️',
  
  // Productos
  'electronicos-computacion': '💻',
  'celulares-accesorios': '📱',
  'electrodomesticos': '🔌',
  'hogar-muebles-decoracion': '🪑',
  'ropa-calzado-accesorios': '👕',
  'belleza-cuidado-personal-productos': '💄',
  'salud-productos': '💊',
  'deportes-hobbies-ocio': '⚽',
  'libros-musica-peliculas-juegos': '📚',
  'ninos-bebes': '🧸',
  'mascotas-productos-animales': '🐾',
  'alimentos-bebidas': '🍔',
  
  // Eventos
  'conciertos-musica-fiestas': '🎵',
  'deportivos': '🏆',
  'culturales-teatro-cine-exposiciones': '🎭',
  'educativos-conferencias-talleres': '📚',
  'sociales-comunitarios-ferias': '🎪',
  'religiosos': '⛪',
  
  // Negocios
  'venta-traspaso-negocios': '🏪',
  'busqueda-socios-inversionistas': '🤝',
  'franquicias': '🌐',
  'oportunidades-negocio-representaciones': '💰',
  
  // Default para cualquier cosa sin emoji específico
  'default': '🔹'
};

// Mapeo de iconos para subcategorías
export const SUBCATEGORY_ICONS: Record<string, ElementType> = {
  // Empleos
  'administracion-oficina-contable': BuildingOfficeIcon,
  'ventas-comercial-marketing': CurrencyDollarIcon,
  'hosteleria-restaurantes-turismo': BuildingStorefrontIcon,
  'construccion-mantenimiento-oficios': WrenchScrewdriverIcon,
  'salud-cuidado-personal': HeartIcon,
  'educacion-docencia': AcademicCapIcon,
  'legal-notarial': BuildingOfficeIcon,
  'belleza-estetica': HeartIcon,
  'tecnologia-informatica-diseno': ComputerDesktopIcon,
  'transporte-logistica-choferes': TruckIcon,
  'seguridad-vigilancia': ShieldCheckIcon,
  'trabajo-domestico': HomeIcon,
  'produccion-operarios-almacen': BeakerIcon,
  'practicas-pasantias': AcademicCapIcon,
  'agricultura-ganaderia-afines': TruckIcon,
  'otros-empleos': BriefcaseIcon,
  
  // Inmuebles
  'departamentos': BuildingOfficeIcon,
  'habitaciones': HomeIcon,
  'casas-chalets': HomeIcon,
  'terrenos-lotes': HomeIcon,
  'locales-oficinas-comercial': BuildingStorefrontIcon,
  'garajes-estacionamientos': TruckIcon,
  'alquileres-temporales-turisticos': CalendarIcon,
  'traspaso-negocios-fondos-comercio': BuildingStorefrontIcon,
  'otros-inmuebles': HomeIcon,
  
  // Vehículos
  'autos-camionetas': TruckIcon,
  'motos-scooters': TruckIcon,
  'buses-camiones-comerciales': TruckIcon,
  'maquinaria-pesada-agricola': TruckIcon,
  'otros-vehiculos': TruckIcon,

  // Servicios, Productos, Eventos, Negocios y Comunidad
  'profesionales-especializados': BriefcaseIcon,
  'tecnicos-reparaciones-casa': WrenchScrewdriverIcon,
  'electronica-computacion': ComputerDesktopIcon,
  'eventos-fiestas': CalendarIcon,
  
  // Valor por defecto
  'default': ShoppingBagIcon
};

// Constante para rutas de imágenes de categorías principales
export const CATEGORY_IMAGES_BASE_PATH = '/images/categories/';

// Obtener ícono para una categoría/subcategoría
export function getCategoryIcon(categorySlug: string): React.ElementType {
  return CATEGORY_ICONS[categorySlug] || CATEGORY_ICONS.default;
}

// Obtener ícono para una subcategoría
export function getSubcategoryIcon(subcategorySlug: string): React.ElementType {
  return SUBCATEGORY_ICONS[subcategorySlug] || SUBCATEGORY_ICONS.default;
}

// Obtener color para una categoría
export function getCategoryColor(categorySlug: string): string {
  return CATEGORY_COLORS[categorySlug] || CATEGORY_COLORS.default;
}

// Obtener imagen para una categoría principal
export function getCategoryImage(categorySlug: string): string {
  return CATEGORY_IMAGES[categorySlug] || CATEGORY_IMAGES.default;
}

// Obtener emoji para una sub-subcategoría
export function getSubSubcategoryEmoji(subsubcategorySlug: string): string {
  return SUBSUBCATEGORY_EMOJIS[subsubcategorySlug] || SUBSUBCATEGORY_EMOJIS.default;
}

// Función para obtener las categorías con su estructura completa
export function getCategories(): Category[] {
  return categoriesList.map(category => {
    // Obtener subcategorías
    const subcategories = category.subcategories.map(subcategory => {
      // Obtener subsubcategorías si existen
      const subSubcategories = subcategory.subSubcategories?.map(subsubcat => {
        return {
          id: subsubcat.id,
          name: subsubcat.name,
          slug: subsubcat.id, // Usar id como slug
          count: Math.floor(Math.random() * 100) + 1, // Simulación de conteos
          emoji: '🔍', // Emoji genérico
          parentId: subcategory.id
        } as SubSubcategory;
      }) || [];

      return {
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.id, // Usar id como slug
        count: Math.floor(Math.random() * 500) + 100, // Simulación de conteos
        icon: getSubcategoryIcon(subcategory.id),
        parentId: category.id,
        subSubcategories: subSubcategories
      } as Subcategory;
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.id, // Usar id como slug
      count: Math.floor(Math.random() * 1000) + 500, // Simulación de conteos
      image: getCategoryImage(category.id),
      subcategories: subcategories
    } as Category;
  });
}

// Construir ruta para navegación
export function buildCategoryPath(
  categorySlug?: string,
  subcategorySlug?: string,
  subsubcategorySlug?: string
): string {
  if (!categorySlug) return '/buscar';
  
  let path = `/${categorySlug}`;
  
  if (subcategorySlug) {
    path += `/${subcategorySlug}`;
    
    if (subsubcategorySlug) {
      path += `/${subsubcategorySlug}`;
    }
  }
  
  return path;
}

// Generar elementos de migas de pan (breadcrumbs)
export function generateBreadcrumbs(
  categories: Category[],
  categorySlug?: string,
  subcategorySlug?: string,
  subsubcategorySlug?: string
) {
  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Buscar', href: '/buscar', active: !categorySlug }
  ];
  
  if (!categorySlug) return breadcrumbs;
  
  const category = categories.find(cat => cat.slug === categorySlug);
  if (!category) return breadcrumbs;
  
  breadcrumbs.push({
    label: category.name,
    href: `/${categorySlug}`,
    active: !subcategorySlug
  });
  
  if (!subcategorySlug) return breadcrumbs;
  
  const subcategory = findSubcategory(categories, categorySlug, subcategorySlug);
  if (!subcategory) return breadcrumbs;
  
  breadcrumbs.push({
    label: subcategory.name,
    href: `/${categorySlug}/${subcategorySlug}`,
    active: !subsubcategorySlug
  });
  
  if (!subsubcategorySlug) return breadcrumbs;
  
  const subsubcategory = findSubSubcategory(
    categories, 
    categorySlug, 
    subcategorySlug, 
    subsubcategorySlug
  );
  
  if (!subsubcategory) return breadcrumbs;
  
  breadcrumbs.push({
    label: subsubcategory.name,
    href: `/${categorySlug}/${subcategorySlug}/${subsubcategorySlug}`,
    active: true
  });
  
  return breadcrumbs;
}

// Encontrar subcategoría por slug
export function findSubcategory(
  categories: Category[], 
  categorySlug: string, 
  subcategorySlug: string
): Subcategory | null {
  const category = categories.find(cat => cat.slug === categorySlug);
  
  if (!category || !category.subcategories) return null;
  
  return category.subcategories.find(sub => sub.slug === subcategorySlug) || null;
}

// Encontrar sub-subcategoría por slug
export function findSubSubcategory(
  categories: Category[],
  categorySlug: string,
  subcategorySlug: string,
  subsubcategorySlug: string
): SubSubcategory | null {
  const subcategory = findSubcategory(categories, categorySlug, subcategorySlug);
  
  if (!subcategory || !subcategory.subSubcategories) return null;
  
  return subcategory.subSubcategories.find(subsub => subsub.slug === subsubcategorySlug) || null;
} 