import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getPublicationModel } from '@/lib/models/Publication'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'inmuebles'
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Connect to database
    await dbConnect()
    
    // Get model for specified category
    const PublicationModel = getPublicationModel(category)
    
    // Build filter
    const filter: any = { status: 'active' }
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }
    
    // Count total for pagination
    const total = await PublicationModel.countDocuments(filter)
    
    // Get results with pagination
    const skip = (page - 1) * limit
    const publications = await PublicationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    return NextResponse.json({
      publications,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    })
  } catch (error: any) {
    console.error('Error fetching publications:', error)
    return NextResponse.json(
      { error: `Error al obtener las publicaciones: ${error.message}` },
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
    
    // Connect to database
    await dbConnect()
    
    // Get model for the specified category
    const categorySlug = data.categorySlug || 'inmuebles'
    const PublicationModel = getPublicationModel(categorySlug)
    
    const now = new Date()
    const publication = new PublicationModel({
      ...data,
      id: data.id || `pub_${Date.now()}`, // Generate ID if not provided
      status: 'active',
      createdAt: now,
      updatedAt: now
    })
    
    // Save the publication
    await publication.save()
    
    return NextResponse.json({ 
      success: true,
      id: publication.id
    })
  } catch (error: any) {
    console.error('Error creating publication:', error)
    return NextResponse.json(
      { error: `Error al crear la publicación: ${error.message}` },
      { status: 500 }
    )
  }
} 