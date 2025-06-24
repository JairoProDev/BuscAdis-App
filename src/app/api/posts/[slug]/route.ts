import { NextResponse } from 'next/server'
import type { Post } from '@/types/blog'
import { getServerMongoClient } from '@/lib/mongodb-server'

// Aquí implementaremos la conexión con la base de datos
const mockPosts: Post[] = [
  // Datos de ejemplo
]

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params
    const { slug } = params
    
    // TODO: Fix MongoDB client usage
    // const { client, db } = await getServerMongoClient()
    // const postsCollection = db.collection('posts')
    // const post = await postsCollection.findOne({ slug })
    // await client.close()
    
    // For now, return a mock post to avoid build errors
    const post = mockPosts.find(p => p.slug === slug)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
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
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params
    const { slug } = params
    const body = await request.json()
    
    // TODO: Fix MongoDB client usage
    // const { client, db } = await getServerMongoClient()
    // const postsCollection = db.collection('posts')
    // const updatedPost = await postsCollection.findOneAndUpdate(
    //   { slug },
    //   { $set: { ...body, updatedAt: new Date() } },
    //   { returnDocument: 'after' }
    // )
    // await client.close()
    
    // For now, return mock response
    const updatedPost = { ...body, slug, updatedAt: new Date() }
    
    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params
    const { slug } = params
    
    // TODO: Fix MongoDB client usage
    // const { client, db } = await getServerMongoClient()
    // const postsCollection = db.collection('posts')
    // const result = await postsCollection.deleteOne({ slug })
    // await client.close()
    
    // For now, return mock response
    const result = { deletedCount: 1 }
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 