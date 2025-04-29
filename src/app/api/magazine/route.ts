import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'buscadis';

export async function GET(request: Request) {
  try {
    // Get limit from URL query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1', 10);
    
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    // Get magazines collection
    const magazinesCollection = db.collection('magazines');
    
    // Fetch magazines
    let magazines;
    
    if (limit === 1) {
      // Fetch just the latest magazine
      const latestMagazine = await magazinesCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();
      
      // Close connection
      await client.close();
      
      if (latestMagazine.length === 0) {
        return NextResponse.json({ magazine: null });
      }
      
      return NextResponse.json({ magazine: latestMagazine[0] });
    } else {
      // Fetch multiple magazines
      magazines = await magazinesCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      // Close connection
      await client.close();
      
      return NextResponse.json({ magazines });
    }
  } catch (error) {
    console.error('[Magazine API] Error fetching magazines:', error);
    return NextResponse.json(
      { message: 'Error al obtener las revistas', error: (error as Error).message },
      { status: 500 }
    );
  }
} 