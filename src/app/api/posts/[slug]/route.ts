import { NextResponse } from 'next/server'
import type { Post } from '@/types/blog'

// Aquí implementaremos la conexión con la base de datos
const mockPosts: Post[] = [
  // Datos de ejemplo
]

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const post = mockPosts.find(p => p.slug === params.slug)

  if (!post) {
    return NextResponse.json(
      { error: 'Post no encontrado' },
      { status: 404 }
    )
  }

  // Incrementar vistas
  post.views += 1

  // Encontrar posts relacionados
  const relatedPosts = mockPosts
    .filter(p => 
      p.id !== post.id && (
        p.category.id === post.category.id ||
        p.tags.some(t => post.tags.some(pt => pt.id === t.id))
      )
    )
    .slice(0, 3)

  return NextResponse.json({
    ...post,
    relatedPosts
  })
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const updates = await request.json()
    const post = mockPosts.find(p => p.slug === params.slug)

    if (!post) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      )
    }

    // Aquí implementaremos la actualización en la base de datos
    Object.assign(post, updates)

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const postIndex = mockPosts.findIndex(p => p.slug === params.slug)

  if (postIndex === -1) {
    return NextResponse.json(
      { error: 'Post no encontrado' },
      { status: 404 }
    )
  }

  // Aquí implementaremos la eliminación en la base de datos
  mockPosts.splice(postIndex, 1)

  return NextResponse.json({ message: 'Post eliminado exitosamente' })
} 