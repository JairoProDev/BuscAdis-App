import { NextResponse } from 'next/server';
import { mongoDbQuery } from '@/lib/mongodb-server';

export async function GET() {
  try {
    // Find all magazines ordered by creation date (newest first)
    const magazineResults = await mongoDbQuery('magazines', {}, { 
      sort: { createdAt: -1 } 
    });
    const magazines = Array.isArray(magazineResults) ? magazineResults : [];
    
    if (magazines.length === 0) {
      return NextResponse.json({ magazines: [] });
    }
    
    // Transform to the expected interface
    const formattedMagazines = magazines.map(magazine => ({
      _id: magazine._id?.toString() || '',
      pdfUrl: magazine.pdfUrl,
      fileId: magazine.fileId?.toString() || '',
      publicationCount: magazine.publicationCount,
      createdAt: magazine.createdAt,
      filename: magazine.filename
    }));
    
    return NextResponse.json({ magazines: formattedMagazines });
  } catch (error) {
    console.error('[Magazine API] Error fetching magazines:', error);
    return NextResponse.json(
      { message: 'Error fetching magazines', error: (error as Error).message },
      { status: 500 }
    );
  }
} 