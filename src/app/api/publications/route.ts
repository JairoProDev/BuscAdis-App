import { NextResponse } from 'next/server'
import getMongoClient from '@/lib/mongodb'
import { Db } from 'mongodb'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'inmuebles'
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    
    const client = await getMongoClient()
    const db: Db = client.db('test')
    
    // Determine collection based on category
    let collectionName = 'publications_inmuebles'
    if (category === 'empleos') collectionName = 'publications_empleos'
    if (category === 'servicios') collectionName = 'publications_servicios'
    if (category === 'vehiculos') collectionName = 'publications_vehiculos'
    
    const collection = db.collection(collectionName)
    
    // Build filter
    const filter: any = { status: 'active' }
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }
    
    // Count total for pagination
    const total = await collection.countDocuments(filter)
    
    // Get results with pagination
    const skip = (page - 1) * limit
    const publications = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    return NextResponse.json({
      publications,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    })
  } catch (error) {
    console.error('Error fetching publications:', error)
    return NextResponse.json(
      { error: 'Error al obtener las publicaciones' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'El título y la descripción son obligatorios' },
        { status: 400 }
      )
    }
    
    const client = await getMongoClient()
    const db = client.db('test')
    
    // Determine collection based on category
    let collectionName = 'publications_inmuebles'
    if (data.categorySlug === 'empleos') collectionName = 'publications_empleos'
    if (data.categorySlug === 'servicios') collectionName = 'publications_servicios'
    if (data.categorySlug === 'vehiculos') collectionName = 'publications_vehiculos'
    
    const collection = db.collection(collectionName)
    
    const now = new Date().toISOString()
    const publication = {
      ...data,
      id: data.id || `pub_${Date.now()}`, // Generate ID if not provided
      status: 'active',
      createdAt: now,
      updatedAt: now
    }
    
    const result = await collection.insertOne(publication)
    
    if (!result.acknowledged) {
      throw new Error('Error al insertar la publicación')
    }
    
    return NextResponse.json({ 
      success: true,
      id: publication.id
    })
  } catch (error) {
    console.error('Error creating publication:', error)
    return NextResponse.json(
      { error: 'Error al crear la publicación' },
      { status: 500 }
    )
  }
} 