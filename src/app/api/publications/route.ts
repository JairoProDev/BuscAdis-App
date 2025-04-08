import { NextResponse } from 'next/server'
import { mongoDbQuery, mongoDbInsert } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const category = searchParams.get('category') || ''
    const subcategory = searchParams.get('subcategory') || ''
    const subsubcategory = searchParams.get('subsubcategory') || ''
    const query = searchParams.get('query') || ''
    const location = searchParams.get('location') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const sortBy = searchParams.get('sortBy') || 'recent'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    // Build MongoDB query
    const mongoQuery: any = {}
    
    if (category) mongoQuery.category = category
    if (subcategory) mongoQuery.subcategory = subcategory
    if (subsubcategory) mongoQuery.subsubcategory = subsubcategory
    
    if (query) {
      mongoQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }
    
    if (location) {
      mongoQuery['location.city'] = { $regex: location, $options: 'i' }
    }
    
    if (minPrice || maxPrice) {
      mongoQuery.price = {}
      if (minPrice) mongoQuery.price.$gte = parseFloat(minPrice)
      if (maxPrice) mongoQuery.price.$lte = parseFloat(maxPrice)
    }
    
    // Sort options
    const sortOptions: any = {}
    switch (sortBy) {
      case 'price_asc':
        sortOptions.price = 1
        break
      case 'price_desc':
        sortOptions.price = -1
        break
      case 'recent':
      default:
        sortOptions.created_at = -1
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Execute the query using server-side MongoDB utilities
    const data = await mongoDbQuery('publications', mongoQuery, {
      sort: sortOptions,
      skip,
      limit
    })
    
    // Get total count for pagination
    const totalCount = data.length // In a real app, this would be a separate count query
    
    return NextResponse.json({
      publications: data,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      page
    })
  } catch (error) {
    console.error('Error in publications API:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch publications' }),
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
    
    // Determine collection based on category
    const categorySlug = data.categorySlug || 'inmuebles'
    const collectionName = `publications_${categorySlug}`
    
    const now = new Date()
    const publicationData = {
      ...data,
      id: data.id || `pub_${Date.now()}`, // Generate ID if not provided
      status: 'active',
      created_at: now,
      updated_at: now
    }
    
    // Save the publication using server-side MongoDB utility
    const result = await mongoDbInsert(collectionName, publicationData)
    
    return NextResponse.json({ 
      success: true,
      id: publicationData.id
    })
  } catch (error: any) {
    console.error('Error creating publication:', error)
    return NextResponse.json(
      { error: `Error al crear la publicación: ${error.message}` },
      { status: 500 }
    )
  }
} 