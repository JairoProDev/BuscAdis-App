import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    Logger.debug('GET /api/health/db received')
    
    const { db } = await connectToDatabase()
    const collection = db.collection(UNIFIED_COLLECTION)
    
    // Get total count of documents
    const totalCount = await collection.countDocuments()
    
    // Get count by status (if status field exists)
    const statusCounts = await collection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    
    // Get count by category
    const categoryCounts = await collection.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    
    const healthData = {
      ok: true,
      timestamp: new Date().toISOString(),
      database: MONGODB_DB,
      collection: UNIFIED_COLLECTION,
      counts: {
        total: totalCount,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item._id || 'null'] = item.count
          return acc
        }, {} as Record<string, number>),
        byCategory: categoryCounts.reduce((acc, item) => {
          acc[item._id || 'null'] = item.count
          return acc
        }, {} as Record<string, number>)
      }
    }
    
    Logger.info('Health check completed', healthData)
    
    return NextResponse.json(healthData)
  } catch (error) {
    Logger.error('Health check failed', { error })
    
    return NextResponse.json({
      ok: false,
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
