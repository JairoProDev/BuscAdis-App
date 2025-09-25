import { NextRequest, NextResponse } from 'next/server';
import { mongoDbQuery } from '@/lib/mongodb-server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  try {
    const params = await context.params;
    const { fileId } = params;
    
    if (!fileId) {
      return NextResponse.json(
        { message: 'File ID is required' },
        { status: 400 }
      );
    }

    // Check if the file exists in the database first
    const magazineResults = await mongoDbQuery(
      'magazines',
      { fileId },
      { limit: 1 }
    );
    const magazine = Array.isArray(magazineResults) && magazineResults.length > 0 ? magazineResults[0] : null;

    // If we have a stored URL, redirect to it
    if (magazine?.pdfUrl && magazine.pdfUrl.startsWith('http')) {
      return NextResponse.redirect(magazine.pdfUrl);
    }

    // Otherwise try to read from local temp directory
    try {
      const filePath = join(process.cwd(), 'temp', fileId);
      const fileBuffer = await readFile(filePath);

      // Create the response with the appropriate headers
      return new NextResponse(new Blob([new Uint8Array(fileBuffer)]), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileId}"`
        }
      });
    } catch (fileError) {
      console.error('[Magazine API] Error reading file:', fileError);
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[Magazine API] Error downloading file:', error);
    return NextResponse.json(
      { message: 'Error downloading file', error: (error as Error).message },
      { status: 500 }
    );
  }
}