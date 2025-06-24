import { NextResponse } from 'next/server';
import { mongoDbQuery } from '@/lib/mongodb-server';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  context: { params: Promise<{ fileId: string }> }
) {
  try {
    const params = await context.params;
    const fileId = params.fileId;
    
    if (!fileId) {
      return NextResponse.json(
        { message: 'File ID is required' },
        { status: 400 }
      );
    }

    // Buscar el archivo en la colección de revistas
    const magazineResults = await mongoDbQuery('magazines_by_category', { 
      fileId: new ObjectId(fileId) 
    }, { limit: 1 });
    const magazine = Array.isArray(magazineResults) && magazineResults.length > 0 ? magazineResults[0] : null;
    
    if (!magazine || !magazine.pdfUrl) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }
    
    // Redirect to the PDF URL
    return NextResponse.redirect(magazine.pdfUrl);
  } catch (error) {
    console.error('[Download API] Error:', error);
    return NextResponse.json(
      { message: 'Error downloading file', error: (error as Error).message },
      { status: 500 }
    );
  }
} 