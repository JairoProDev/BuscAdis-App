import { NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb'
import { Logger } from '@/services/logging.service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI!
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'
const UNIFIED_COLLECTION = 'adisos'

// Cache de conexión
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB)
    
    cachedClient = client
    cachedDb = db
    
    Logger.info('Connected to MongoDB successfully')
    return { client, db }
  } catch (error) {
    Logger.error('Failed to connect to MongoDB', { error })
    throw error
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await context.params;
    Logger.debug('GET /api/publications/category/[category] received', { category })
    
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const subcategory = searchParams.get('subcategory') || ''
    const subsubcategory = searchParams.get('subSubcategory') || searchParams.get('subsubcategory') || ''
    const searchQuery = searchParams.get('query') || searchParams.get('search') || ''
    const department = searchParams.get('department') || searchParams.get('region') || ''
    const province = searchParams.get('province') || ''
    const city = searchParams.get('city') || ''
    const district = searchParams.get('district') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const sortBy = searchParams.get('sortBy') || 'recent'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    // Do not force default status; only filter if provided
    const status = searchParams.get('status') || ''
    const premium = searchParams.get('premium') || ''

    Logger.debug('Search parameters', {
      category,
      subcategory,
      subsubcategory,
      searchQuery,
      department,
      province,
      city,
      district,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
      status,
      premium
    })

    const { db } = await connectToDatabase()
    const collection = db.collection(UNIFIED_COLLECTION)

    // Build query
    const query: any = {}

    // Category filter
    if (category && category !== 'all') {
      query.categorySlug = category
    }

    // Subcategory filter
    if (subcategory) {
      query.subcategorySlug = subcategory
    }

    // Sub-subcategory filter
    if (subsubcategory) {
      query.subSubcategorySlug = subsubcategory
    }

    // Search query
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    }

    // Location filters
    if (department) {
      query['location.department'] = department
    }
    if (province) {
      query['location.province'] = province
    }
    if (city) {
      query['location.city'] = city
    }
    if (district) {
      query['location.district'] = district
    }

    // Price filters
    if (minPrice || maxPrice) {
      query.value = {}
      if (minPrice) {
        query.value.$gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        query.value.$lte = parseFloat(maxPrice)
      }
    }

    // Status filter
    if (status) {
      query.status = status
    }

    // Premium filter
    if (premium === 'true') {
      query.premium = true
    } else if (premium === 'false') {
      query.premium = false
    }

    // Build sort
    let sort: any = {}
    switch (sortBy) {
      case 'recent':
        sort = { createdAt: -1 }
        break
      case 'price-asc':
        sort = { value: 1 }
        break
      case 'price-desc':
        sort = { value: -1 }
        break
      case 'views':
        sort = { views: -1 }
        break
      case 'distance':
        sort = { createdAt: -1 } // Default to recent if distance not implemented
        break
      default:
        sort = { createdAt: -1 }
    }

    // Execute query
    const skip = (page - 1) * limit
    Logger.debug('Mongo query for /api/publications/category', { query })
    const [publications, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query)
    ])

    // Format publications
    const formattedPublications = publications.map(pub => {
      const pricing = pub.pricing || {}
      const loc = pub.location || {}
      const contact = pub.contact || {}
      
      return {
        id: pub._id?.toString() || pub.id,
        title: pub.title || 'Sin título',
        description: pub.description || '',
        value: pricing.amount || pub.value || pub.amount || 0,
        price: pricing.amount || pub.value || pub.amount || 0,
        amount: pricing.amount || pub.value || pub.amount || 0,
        currency: pricing.currency || pub.currency || 'PEN',
        categorySlug: pub.categorySlug || pub.category || '',
        subcategorySlug: pub.subcategorySlug || pub.subcategory || null,
        subSubcategorySlug: pub.subSubcategorySlug || pub.subsubcategory || null,
        // Location as structured object
        location: {
          reference: loc.reference || loc.address || '',
          district: loc.district || '',
          province: loc.province || loc.region || '',
          city: loc.city || loc.department || 'Cusco',
          country: loc.country || (loc.countryCode === 'PE' ? 'Perú' : 'Perú')
        },
        fullLocation: loc,
        locationString: [loc.district, loc.province || loc.region, loc.city || loc.department]
          .filter(Boolean)
          .join(', ') || 'Cusco, Perú',
        contact: {
          name: contact.name || pub.contactName || '',
          phone: Array.isArray(contact.phones) ? contact.phones[0] : (contact.phone || pub.contactPhone || ''),
          email: contact.email || pub.contactEmail || '',
          phones: Array.isArray(contact.phones) ? contact.phones : []
        },
        whatsapp: Array.isArray(contact.phones) ? contact.phones[0] : (contact.phone || pub.contactPhone || ''),
        images: Array.isArray(pub.images) ? pub.images : [],
        status: pub.status || 'active',
        premium: pub.premium || false,
        createdAt: pub.createdAt || pub.created_at || new Date().toISOString(),
        updatedAt: pub.updatedAt || pub.updated_at || pub.createdAt || new Date().toISOString(),
        views: pub.views || 0,
        featured: pub.featured || false,
        attributes: pub.attributes || {},
        isActive: pub.isActive !== false,
        sequentialId: pub.sequentialId
      }
    })

    Logger.info('Returning publications', {
      total,
      page,
      category,
      searchQuery
    })

    return NextResponse.json({
      publications: formattedPublications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    Logger.error('Error in publications API', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
