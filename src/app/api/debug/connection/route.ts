import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI!
    const MONGODB_DB = process.env.MONGODB_DB || 'buscadis'
    
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB)
    
    // Get database stats
    const stats = await db.stats()
    
    // List all collections
    const collections = await db.listCollections().toArray()
    
    // Check adisos collection
    const adisosExists = collections.find(c => c.name === 'adisos')
    let adisosCount = 0
    let sampleDoc = null
    
    if (adisosExists) {
      const adisosCollection = db.collection('adisos')
      adisosCount = await adisosCollection.countDocuments()
      sampleDoc = await adisosCollection.findOne({})
    }
    
    await client.close()
    
    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      database: {
        name: MONGODB_DB,
        sizeOnDisk: stats.dataSize,
        collections: collections.map(c => c.name),
        collectionsCount: collections.length
      },
      adisos: {
        exists: !!adisosExists,
        count: adisosCount,
        hasSampleDoc: !!sampleDoc,
        sampleDocId: sampleDoc?._id?.toString()
      },
      connectionString: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    })
    
  } catch (error) {
    const err = error as Error
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 })
  }
}
