import { NextResponse } from 'next/server'
import { getServerMongoClient } from '@/lib/mongodb-server'
import { Logger } from '@/services/logging.service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Sample data para testing inmediato
const SAMPLE_PUBLICATIONS = [
  {
    id: 'emp_001',
    title: 'Desarrollador Full Stack',
    description: 'Buscamos desarrollador con experiencia en React y Node.js para proyecto innovador en Cusco.',
    price: 3500,
    currency: 'PEN',
    categorySlug: 'empleos',
    subcategory: 'tecnologia',
    location: { city: 'Cusco', region: 'Cusco' },
    contactName: 'María García',
    contactPhone: '+51 984 123 456',
    status: 'active',
    createdAt: new Date().toISOString(),
    images: ['/images/placeholder-image.jpg'],
    premium: false,
    verified: true
  },
  {
    id: 'emp_002', 
    title: 'Chef de Cocina',
    description: 'Restaurant en el centro histórico busca chef con experiencia en cocina peruana e internacional.',
    price: 2800,
    currency: 'PEN',
    categorySlug: 'empleos',
    subcategory: 'gastronomia',
    location: { city: 'Cusco', region: 'Cusco' },
    contactName: 'Carlos Mendoza',
    contactPhone: '+51 984 654 321',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
    images: ['/images/placeholder-image.jpg'],
    premium: true,
    verified: true
  },
  {
    id: 'emp_003',
    title: 'Guía Turístico Bilingüe',
    description: 'Se busca guía turístico con inglés fluido para tours a Machu Picchu y Valle Sagrado.',
    price: 2200,
    currency: 'PEN',
    categorySlug: 'empleos',
    subcategory: 'turismo',
    location: { city: 'Cusco', region: 'Cusco' },
    contactName: 'Ana Quispe',
    contactPhone: '+51 984 789 123',
    status: 'active',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
    images: ['/images/placeholder-image.jpg'],
    premium: false,
    verified: false
  },
  {
    id: 'inmueble_001',
    title: 'Casa Colonial en San Blas',
    description: 'Hermosa casa colonial restaurada en el pintoresco barrio de San Blas, 3 dormitorios, 2 baños.',
    price: 450000,
    currency: 'PEN',
    categorySlug: 'inmuebles',
    subcategory: 'casas',
    location: { city: 'Cusco', region: 'Cusco' },
    contactName: 'Jorge Huamán',
    contactPhone: '+51 984 456 789',
    status: 'active',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
    images: ['/images/placeholder-image.jpg'],
    premium: true,
    verified: true
  },
  {
    id: 'vehiculo_001',
    title: 'Toyota Corolla 2020',
    description: 'Vendo Toyota Corolla 2020, automático, full equipo, 45,000 km, único dueño.',
    price: 65000,
    currency: 'PEN',
    categorySlug: 'vehiculos',
    subcategory: 'autos',
    location: { city: 'Cusco', region: 'Cusco' },
    contactName: 'Pedro Vargas',
    contactPhone: '+51 984 321 654',
    status: 'active',
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 días atrás
    images: ['/images/placeholder-image.jpg'],
    premium: false,
    verified: true
  }
];

export async function GET(request: Request) {
  try {
    Logger.debug('GET /api/publications received');
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const category = searchParams.get('category') || '';
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sortBy') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    Logger.debug('Search parameters', { 
      category, query, location, minPrice, maxPrice, sortBy, page, limit 
    });

    // Por ahora, usar datos de muestra para que funcione inmediatamente
    let filteredData = [...SAMPLE_PUBLICATIONS];

    // Filtrar por categoría
    if (category) {
      filteredData = filteredData.filter(pub => pub.categorySlug === category);
    }

    // Filtrar por búsqueda de texto
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredData = filteredData.filter(pub => 
        pub.title.toLowerCase().includes(searchTerm) ||
        pub.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por ubicación
    if (location) {
      const locationTerm = location.toLowerCase();
      filteredData = filteredData.filter(pub => {
        const locationString = typeof pub.location === 'string' 
          ? pub.location 
          : `${(pub.location as any).city} ${(pub.location as any).region}`;
        return locationString.toLowerCase().includes(locationTerm);
      });
    }

    // Filtrar por precio
    if (minPrice || maxPrice) {
      filteredData = filteredData.filter(pub => {
        const price = pub.price;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Ordenar resultados
    filteredData.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Aplicar paginación
    const totalCount = filteredData.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + limit);

    // Formatear datos para el frontend
    const formattedData = paginatedData.map(pub => ({
      ...pub,
      location: typeof pub.location === 'string' ? pub.location : `${pub.location.city}, ${pub.location.region}`,
      images: pub.images || ['/images/placeholder-image.jpg']
    }));

    Logger.info(`Returning ${formattedData.length} publications`, { 
      total: totalCount, 
      page, 
      category 
    });

    return NextResponse.json({
      publications: formattedData,
      total: totalCount,
      page: page,
      pages: Math.ceil(totalCount / limit),
      success: true
    });

  } catch (error) {
    Logger.error('Critical error in GET /api/publications', { error });
    
    return NextResponse.json({
      publications: [],
      total: 0,
      page: 1,
      pages: 1,
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    Logger.debug('POST /api/publications received');
    
    const data = await request.json();
    Logger.debug('Received publication data', { title: data.title, category: data.categorySlug });

    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: 'Título y descripción son requeridos' },
        { status: 400 }
      );
    }

    // Crear nueva publicación
    const newPublication = {
      ...data,
      id: `pub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Por ahora, solo simular la creación
    Logger.info('Publication created successfully', { id: newPublication.id });

    return NextResponse.json({
      success: true,
      publication: newPublication,
      message: 'Publicación creada exitosamente'
    });

  } catch (error) {
    Logger.error('Critical error in POST /api/publications', { error });
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 