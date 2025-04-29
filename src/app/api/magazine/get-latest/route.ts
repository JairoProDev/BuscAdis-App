import { NextResponse } from 'next/server';
import { getServerMongoClient } from '@/lib/mongodb-server';

export async function GET() {
  try {
    const { client, db } = await getServerMongoClient();
    
    // Find the latest magazine by creation date
    const magazinesCollection = db.collection('magazines');
    const latestMagazine = await magazinesCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    
    await client.close();
    
    if (latestMagazine.length === 0) {
      return NextResponse.json({ magazine: null });
    }
    
    const magazine = latestMagazine[0];
    return NextResponse.json({ 
      magazine: {
        _id: magazine._id.toString(),
        pdfUrl: magazine.pdfUrl,
        fileId: magazine.fileId.toString(),
        publicationCount: magazine.publicationCount,
        createdAt: magazine.createdAt,
        filename: magazine.filename
      }
    });
  } catch (error) {
    console.error('[Magazine API] Error fetching latest magazine:', error);
    return NextResponse.json(
      { message: 'Error fetching magazine', error: (error as Error).message },
      { status: 500 }
    );
  }
} 