import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import CategorySearchPageClient from './CategorySearchPageClient'

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// Categorías válidas
const validCategories = [
  'empleos', 'inmuebles', 'vehiculos', 'servicios', 
  'productos', 'eventos', 'negocios', 'comunidad'
]

const categoryNames: Record<string, string> = {
  empleos: 'Empleos',
  inmuebles: 'Inmuebles',
  vehiculos: 'Vehículos',
  servicios: 'Servicios',
  productos: 'Productos',
  eventos: 'Eventos',
  negocios: 'Negocios',
  comunidad: 'Comunidad'
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const categoryName = categoryNames[category] || 'Búsqueda'
  
  return {
    title: `${categoryName} - BuscAdis`,
    description: `Encuentra los mejores ${categoryName.toLowerCase()} en tu zona. Publica y busca gratis en BuscAdis.`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params
  
  // Never intercept API routes
  if (category.startsWith('api')) {
    redirect('/')
  }
  
  if (!validCategories.includes(category)) {
    redirect('/')
  }
  
  const resolvedSearchParams = searchParams ? await searchParams : {}
  
  // Renderizar la página de búsqueda con la categoría desde la URL
  return <CategorySearchPageClient category={category} searchParams={resolvedSearchParams} />
}