import { NextResponse } from 'next/server'
import type { Post } from '@/types/blog'

// Aquí implementaremos la conexión con la base de datos
const mockPosts: Post[] = [
  // Datos de ejemplo
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const tag = searchParams.get('tag')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  let filteredPosts = [...mockPosts]

  // Aplicar filtros
  if (category) {
    filteredPosts = filteredPosts.filter(post => post.category.slug === category)
  }

  if (tag) {
    filteredPosts = filteredPosts.filter(post => 
      post.tags.some(t => t.slug === tag)
    )
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower)
    )
  }

  // Paginación
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedPosts = filteredPosts.slice(start, end)

  return NextResponse.json({
    posts: paginatedPosts,
    total: filteredPosts.length,
    page,
    totalPages: Math.ceil(filteredPosts.length / limit)
  })
}

export async function POST(request: Request) {
  try {
    const post = await request.json()
    
    // Aquí implementaremos la validación y guardado en la base de datos
    
    return NextResponse.json({ message: 'Post creado exitosamente' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear el post' },
      { status: 500 }
    )
  }
} 