import { NextResponse } from 'next/server';
import { MongoClient, Db } from 'mongodb'
import { Logger } from '@/services/logging.service'
import type { SortDirection } from 'mongodb';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Force redeployment - fix production issue

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

// Logging function
function log(message: string, data?: any) {
  console.log(`[PUBLICATIONS-API] ${new Date().toISOString()}: ${message}`, data || '');
}

export async function GET(request: Request) {
  log('=== PUBLICATIONS API CALLED ===');
  log('Request URL:', request.url);
  log('Environment:', process.env.NODE_ENV);
  
  try {
    Logger.debug('GET /api/publications received')
    const { searchParams } = new URL(request.url)
    
    log('Search params:', Object.fromEntries(searchParams.entries()));

    // Extract query parameters
    const category = searchParams.get('category') || ''
    const subcategory = searchParams.get('subcategory') || ''
    const subsubcategory = searchParams.get('subSubcategory') || searchParams.get('subsubcategory') || ''
    const searchQuery = searchParams.get('query') || searchParams.get('search') || ''
    const department = searchParams.get('department') || searchParams.get('region') || ''
    const province = searchParams.get('province') || ''
    const city = searchParams.get('city') || ''
    const district = searchParams.get('district') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const sortBy = searchParams.get('sortBy') || 'publicationDate'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    // Important: do NOT force a default status in production. Only filter when explicitly provided.
    const status = searchParams.get('status') || ''
    const premium = searchParams.get('premium') || ''

    Logger.debug('Search parameters', { 
      category, subcategory, subsubcategory, searchQuery, department, province, city, district, minPrice, maxPrice, sortBy, page, limit, status, premium
    })

    // Conectar a la base de datos
    const { db } = await connectToDatabase()

    let allPublications: Record<string, unknown>[] = []
    let totalCount = 0

    // Construir query de filtros
    const buildQuery = () => {
      const query: Record<string, unknown> = {}

      // Estado y premium
      if (status) query.status = status
      if (premium) query.premium = premium === 'true'

      // Clasificación
      if (category && category !== 'all') query.category = category
      if (subcategory) query.subcategory = subcategory
      if (subsubcategory) query.subsubcategory = subsubcategory

      // Ubicación
      if (department) query['location.region'] = { $regex: department, $options: 'i' }
      if (province) query['location.province'] = { $regex: province, $options: 'i' }
      if (city) query['location.city'] = { $regex: city, $options: 'i' }
      if (district) query['location.district'] = { $regex: district, $options: 'i' }

      // Texto
      if (searchQuery) {
        // Prefer $text if index exists, fallback to regex
        query.$text = { $search: searchQuery }
      }

      // Precio
      if (minPrice || maxPrice) {
        query['pricing.amount'] = {}
        if (minPrice) (query['pricing.amount'] as Record<string, unknown>).$gte = parseFloat(minPrice)
        if (maxPrice) (query['pricing.amount'] as Record<string, unknown>).$lte = parseFloat(maxPrice)
      }

      return query
    }

    const mongoQuery = buildQuery()
    log('MongoDB query built:', mongoQuery)
    Logger.debug('Mongo query for /api/publications', { mongoQuery })

    log('Connecting to MongoDB...');
    const { client, db } = await connectToDatabase()
    log('MongoDB connected successfully')
    
    const collection = db.collection(UNIFIED_COLLECTION)
    log('Collection created:', UNIFIED_COLLECTION)

    // Paginación
    const skip = (page - 1) * limit
    log('Pagination - skip:', skip, 'limit:', limit)

    log('Executing MongoDB query...');
    const [publications, total] = await Promise.all([
      collection
        .find(mongoQuery)
        .sort(getUnifiedSort(sortBy))
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(mongoQuery)
    ])
    
    log('MongoDB query results:', {
      publicationsFound: publications.length,
      totalCount: total
    })

    allPublications = (publications as Record<string, unknown>[]) || []
    totalCount = total || 0
    
    await client.close()
    log('MongoDB connection closed')

    // Formatear datos para el frontend
    const formattedPublications = allPublications.map(p => {
      const anyDoc = p as Record<string, unknown>
      const id = (anyDoc._id as { toString: () => string } | undefined)?.toString() || (anyDoc.id as string | undefined)
      const pricing = (anyDoc.pricing as { amount?: number, currency?: string } | undefined) || {}
      const loc = (anyDoc.location as Record<string, unknown> | undefined) || {}
      const contact = (anyDoc.contact as Record<string, unknown> | undefined) || {}

      return {
        ...anyDoc,
        id,
        _id: id,
        category: (anyDoc.category as string) || (anyDoc.categorySlug as string) || '',
        categorySlug: (anyDoc.category as string) || '',
        subcategory: (anyDoc.subcategory as string) || '',
        subsubcategory: (anyDoc.subsubcategory as string) || '',
        location: [loc.district, (loc.province as string) || (loc.region as string), loc.city]
          .filter(Boolean)
          .join(', ') || 'Cusco',
        fullLocation: loc,
        price: pricing.amount ?? (anyDoc.price as number | undefined) ?? 0,
        amount: pricing.amount ?? 0,
        currency: pricing.currency || (anyDoc.currency as string) || 'PEN',
        images: Array.isArray(anyDoc.images) && (anyDoc.images as unknown[])?.length
          ? (anyDoc.images as string[])
          : ['/images/placeholder-image.jpg'],
        status: (anyDoc.status as string) || 'active',
        createdAt: (anyDoc.source as { originalPublicationDate?: string } | undefined)?.originalPublicationDate || (anyDoc.createdAt as string) || new Date().toISOString(),
        contactName: (contact.name as string) || 'Contacto',
        contactPhone: Array.isArray(contact.phones) ? (contact.phones as string[])[0] || '' : '',
        district: (loc.district as string) || '',
        province: ((loc.province as string) || (loc.region as string) || '') as string,
        negotiable: (anyDoc.negotiable as boolean) || false
      }
    })

    Logger.info(`Returning ${formattedPublications.length} publications`, { 
      total: totalCount, 
      page, 
      category: category || 'all',
      searchQuery,
      appliedQuery: mongoQuery
    })

    const response = {
      publications: formattedPublications,
      total: totalCount,
      page: page,
      pages: Math.ceil(totalCount / limit),
      success: true,
      hasMore: page * limit < totalCount,
      debug: {
        environment: process.env.NODE_ENV,
        vercelRegion: process.env.VERCEL_REGION,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      }
    }
    
    log('Final response prepared:', {
      total: totalCount, 
      returned: formattedPublications.length,
      page,
      pages: Math.ceil(totalCount / limit)
    });

    log('Returning response...');
    return NextResponse.json(response)

  } catch (error) {
    log('ERROR OCCURRED:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    Logger.error('Critical error in GET /api/publications', { error })
    
    const errorResponse = {
      publications: [],
      total: 0,
      page: 1,
      pages: 1,
      success: false,
      error: 'Error interno del servidor',
      hasMore: false,
      debug: {
        environment: process.env.NODE_ENV,
        vercelRegion: process.env.VERCEL_REGION,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
        errorMessage: error.message
      }
    };
    
    log('Returning error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    Logger.debug('POST /api/publications received')
    
    const data = await request.json()
    Logger.debug('Received publication data', { title: data.title, category: data.categorySlug })

    // Validaciones básicas
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'Título y descripción son requeridos' },
        { status: 400 }
      )
    }

    if (!data.category && !data.categorySlug) {
      return NextResponse.json(
        { error: 'Categoría inválida' },
        { status: 400 }
      )
    }

    // Conectar a la base de datos
    const { db } = await connectToDatabase()

    // Preparar documento para inserción
    const now = new Date()

    // Compute next sequentialId atomically using counters collection
    const counters = db.collection('counters')
    const seqDoc = await counters.findOneAndUpdate(
      { _id: 'adisos_sequential' } as any,
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    )
    const sequentialId = seqDoc?.value?.seq ?? 1;

    const newPublication = {
      ...data,
      _id: generateObjectId(),
      sequentialId,
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
      // Campos adicionales
      views: 0,
      premium: data.premium || false,
      verified: false,
      engagement: {
        views: 0,
        likes: 0,
        shares: 0,
        saves: 0
      },
      source: {
        type: 'web_form',
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      metrics: {
        impressions: 0, cardClicks: 0, detailViews: 0, shares: 0, saves: 0, contactClicks: 0, chatInteractions: 0
      }
    }

    // Insert into unified collection
    const collection = db.collection(UNIFIED_COLLECTION)
    
    const result = await collection.insertOne(newPublication)
    
    if (!result.insertedId) {
      throw new Error('Failed to insert publication')
    }

    Logger.info('Publication created successfully', { 
      sequentialId,
      category: data.category || data.categorySlug,
      collection: UNIFIED_COLLECTION 
    })

    return NextResponse.json({
      success: true,
      publication: { ...newPublication, _id: result.insertedId.toString() },
      message: 'Publicación creada exitosamente'
    })

  } catch (error) {
    Logger.error('Critical error in POST /api/publications', { error })
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para generar ObjectId
function generateObjectId() {
  return new Date().getTime().toString(16) + Math.random().toString(16).substring(2, 14)
}

// Función auxiliar para opciones de ordenamiento
function getUnifiedSort(sortBy: string): { [key: string]: SortDirection } {
  switch (sortBy) {
    case 'price_asc':
      return { 'pricing.amount': 1 as SortDirection }
    case 'price_desc':
      return { 'pricing.amount': -1 as SortDirection }
    case 'publicationDate':
    default:
      // Ordenar por fecha de publicación original si existe, luego por createdAt
      return { 'source.originalPublicationDate': -1 as SortDirection, createdAt: -1 as SortDirection }
  }
}