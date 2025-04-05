import { NextResponse } from 'next/server';
import getMongoClient from '@/lib/mongodb';

export const dynamic = 'force-dynamic'; // Disable caching

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const categorySlug = params.category.toLowerCase();
    
    if (!categorySlug) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }
    
    const client = await getMongoClient();
    const db = client.db('test');
    
    // Count across all publication collections
    const inmuebles = await db.collection('publications_inmuebles').countDocuments({
      categorySlug: categorySlug
    });
    
    const empleos = await db.collection('publications_empleos').countDocuments({
      categorySlug: categorySlug
    });
    
    const servicios = await db.collection('publications_servicios').countDocuments({
      categorySlug: categorySlug
    });
    
    const vehiculos = await db.collection('publications_vehiculos').countDocuments({
      categorySlug: categorySlug
    });
    
    const total = inmuebles + empleos + servicios + vehiculos;
    
    return NextResponse.json({ count: total });
  } catch (error) {
    console.error(`Error getting count for category ${params.category}:`, error);
    return NextResponse.json(
      { error: 'Error retrieving category count' },
      { status: 500 }
    );
  }
} 