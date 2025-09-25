import { NextRequest, NextResponse } from 'next/server';
import { generateCategoryMagazine } from '@/features/magazine/services/pdf.service';

export async function POST(request: NextRequest) {
  try {
    const { categoryId } = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { message: 'Category ID is required' },
        { status: 400 }
      );
    }

    const result = await generateCategoryMagazine(categoryId);
    
    return NextResponse.json({
      message: 'Magazine generated successfully',
      ...result
    });
  } catch (error) {
    console.error('[Magazine API] Error generating magazine:', error);
    return NextResponse.json(
      { message: 'Error generating magazine', error: (error as Error).message },
      { status: 500 }
    );
  }
}