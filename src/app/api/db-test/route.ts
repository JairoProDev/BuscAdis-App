import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startTime = Date.now()
  
  try {
    const uri = process.env.MONGODB_URI!
    const dbName = process.env.MONGODB_DB || 'buscadis'
    
    console.log('🔄 Connecting to MongoDB...', { 
      env: process.env.NODE_ENV,
      hasUri: !!uri,
      uriStart: uri?.substring(0, 20)
    })
    
    // Force shorter timeout for debugging
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds max
      connectTimeoutMS: 5000
    })
    
    console.log('⏳ Attempting connection...')
    await client.connect()
    console.log('✅ Connected in', Date.now() - startTime, 'ms')
    
    const db = client.db(dbName)
    
    // Test 1: Can we ping?
    await db.admin().ping()
    console.log('✅ Ping successful')
    
    // Test 2: List databases
    const adminDb = client.db('admin')
    const dbList = await adminDb.admin().listDatabases()
    console.log('📊 Databases:', dbList.databases.map(d => d.name))
    
    // Test 3: Check our database exists
    const ourDbExists = dbList.databases.find(d => d.name === dbName)
    console.log('🔍 Our database exists:', !!ourDbExists)
    
    // Test 4: List collections in our database
    const collections = await db.listCollections().toArray()
    console.log('📁 Collections:', collections.map(c => c.name))
    
    // Test 5: Check adisos collection
    const adisosExists = collections.find(c => c.name === 'adisos')
    console.log('📦 Adisos collection exists:', !!adisosExists)
    
    let adisosData = null
    if (adisosExists) {
      const adisos = db.collection('adisos')
      const count = await adisos.countDocuments()
      const sample = await adisos.findOne({})
      
      console.log('📊 Adisos count:', count)
      console.log('📝 Sample doc:', sample?._id)
      
      adisosData = {
        count,
        sampleId: sample?._id?.toString(),
        sampleCategory: (sample as any)?.category,
        sampleTitle: (sample as any)?.title
      }
    }
    
    await client.close()
    
    const elapsed = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      elapsed: `${elapsed}ms`,
      env: process.env.NODE_ENV,
      dbName,
      databases: dbList.databases.map(d => ({ name: d.name, sizeOnDisk: d.sizeOnDisk })),
      ourDbExists: !!ourDbExists,
      collections: collections.map(c => c.name),
      adisos: adisosData,
      uriPreview: uri.substring(0, 30) + '...'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
    
  } catch (error) {
    const err = error as Error
    const elapsed = Date.now() - startTime
    
    console.error('❌ Error:', err.message, 'after', elapsed, 'ms')
    console.error('Error name:', err.name)
    console.error('Error stack:', err.stack)
    
    return NextResponse.json({
      success: false,
      error: err.message,
      errorName: err.name,
      elapsed: `${elapsed}ms`,
      env: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoDb: process.env.MONGODB_DB
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  }
}
