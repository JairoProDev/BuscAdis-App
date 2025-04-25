import { Category, Subcategory, SubSubcategory } from '../types';
import { 
  BriefcaseIcon, 
  HomeIcon, 
  TruckIcon, 
  WrenchIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// Mapeo de iconos por categoría
export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'empleos': BriefcaseIcon,
  'inmuebles': HomeIcon,
  'vehiculos': TruckIcon,
  'servicios': WrenchIcon,
  'productos': ShoppingBagIcon,
  'eventos': CalendarIcon,
  'negocios': ChartBarIcon,
  'comunidad': UserGroupIcon,
  'default': StarIcon,
  'tecnologia': StarIcon,  // Añadir icono real
  'administracion': StarIcon,  // Añadir icono real
  'salud': StarIcon,  // Añadir icono real
  'educacion': StarIcon,  // Añadir icono real
  'hosteleria': StarIcon,  // Añadir icono real
  'construccion': StarIcon,  // Añadir icono real
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
  'tecnologia': 'cyan',
  'administracion': 'indigo',
  'salud': 'emerald',
  'educacion': 'sky',
  'hosteleria': 'amber',
  'construccion': 'lime'
};

// Obtener ícono para una categoría
export function getCategoryIcon(categorySlug: string): React.ElementType {
  return CATEGORY_ICONS[categorySlug] || CATEGORY_ICONS.default;
}

// Obtener color para una categoría
export function getCategoryColor(categorySlug: string): string {
  return CATEGORY_COLORS[categorySlug] || CATEGORY_COLORS.default;
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
  
  if (!subcategory || !subcategory.subsubcategories) return null;
  
  return subcategory.subsubcategories.find(subsub => subsub.slug === subsubcategorySlug) || null;
} 