import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getPublicationModel } from '@/lib/models/Publication';

export const dynamic = 'force-dynamic'; // Disable caching

// Este es el tipo correcto para las rutas dinámicas en Next.js App Router
type Props = {
  params: {
    category: string;
  };
};

export async function GET(request: Request, { params }: Props) {
  try {
    const categorySlug = params.category.toLowerCase();
    
    if (!categorySlug) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Count across all publication collections
    // Get models for each category type
    const inmueblesModel = getPublicationModel('inmuebles');
    const empleosModel = getPublicationModel('empleos');
    const serviciosModel = getPublicationModel('servicios');
    const vehiculosModel = getPublicationModel('vehiculos');
    
    // Count in each collection
    const inmuebles = await inmueblesModel.countDocuments({
      categorySlug: categorySlug
    });
    
    const empleos = await empleosModel.countDocuments({
      categorySlug: categorySlug
    });
    
    const servicios = await serviciosModel.countDocuments({
      categorySlug: categorySlug
    });
    
    const vehiculos = await vehiculosModel.countDocuments({
      categorySlug: categorySlug
    });
    
    const total = inmuebles + empleos + servicios + vehiculos;
    
    return NextResponse.json({ count: total });
  } catch (error: any) {
    console.error(`Error getting count for category ${params.category}:`, error);
    return NextResponse.json(
      { error: `Error retrieving category count: ${error.message}` },
      { status: 500 }
    );
  }
} 