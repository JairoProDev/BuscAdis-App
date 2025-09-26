import { NextResponse } from 'next/server'
import { MongoClient, Db } from 'mongodb'
import { Logger } from '@/services/logging.service'
import type { PublicationDocument } from '@/types/api'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

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
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params
  const { userId } = params
  try {
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    Logger.debug('GET /api/users/[userId]/publications received', { userId })
    
    const { db } = await connectToDatabase()
    const collection = db.collection(UNIFIED_COLLECTION)
    
    // Search in unified collection for user publications
    const query = { 
      $or: [
        { userId: userId },
        { 'contact.userId': userId },
        { 'contact.email': userId } // In case userId is actually an email
      ]
    }
    
    Logger.debug('User publications query', { userId, query })
    
    const publications = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    
    const formattedPublications = publications.map((pub) => ({
      ...(pub as unknown as PublicationDocument),
      id: pub._id?.toString?.() ?? '',
      categoryString: pub.category || '',
      collection: UNIFIED_COLLECTION
    }))
    
    Logger.info(`Found ${formattedPublications.length} publications for user ${userId}`, {
      userId,
      total: formattedPublications.length
    })
    
    return NextResponse.json({
      publications: formattedPublications,
      total: formattedPublications.length
    })
  } catch (error) {
    Logger.error('Error fetching user publications', { error, userId })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 