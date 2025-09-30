import { redirect } from 'next/navigation'

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

// Categorías válidas
const validCategories = [
  'empleos', 'inmuebles', 'vehiculos', 'servicios', 
  'productos', 'eventos', 'negocios', 'comunidad'
]

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  
  // Never intercept API routes
  if (category.startsWith('api')) {
    redirect('/')
  }
  
  if (!validCategories.includes(category)) {
    redirect('/')
  }
  
  // Redirigir a la página de búsqueda con la categoría como parámetro
  redirect(`/buscar?category=${category}`)
}