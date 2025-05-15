import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb-adapter'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('test')
    const posts = db.collection('posts')
    
    const data = await posts
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Error al obtener los posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const post = await request.json()
    
    const client = await clientPromise
    const db = client.db('test')
    const posts = db.collection('posts')
    
    const result = await posts.insertOne({
      ...post,
      createdAt: new Date().toISOString()
    })
    
    if (!result.acknowledged) {
      throw new Error('Failed to insert document')
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Error al crear el post' },
      { status: 500 }
    )
  }
} 