import { NextResponse } from 'next/server'
import { mongoDbQuery, mongoDbInsert } from '@/lib/mongodb.server'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

// Debug flag
const DEBUG = true;

function logDebug(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[Publications API Debug] ${message}`, data ? data : '');
  }
}

function logError(message: string, error: any) {
  console.error(`[Publications API Error] ${message}:`, error);
  if (error?.stack) {
    console.error('Stack:', error.stack);
  }
}

// Types for publications API
interface PublicationLocation {
  city: string;
  region: string;
}

interface PublicationData {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string;
  location: PublicationLocation | string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: string;
  created_at: Date | string;
  updated_at?: Date | string;
  images?: string[];
  [key: string]: unknown; // Allow additional properties
}

interface MongoQuery {
  subcategory?: string;
  $or?: Array<{[key: string]: unknown}>;
  'location.city'?: {$regex: string, $options: string};
  price?: {
    $gte?: number;
    $lte?: number;
  };
}

interface SortOptions {
  price?: number;
  created_at?: number;
}

// Get all collections to search in
const CATEGORY_COLLECTIONS: {[key: string]: string} = {
  'empleos': 'publications_empleos',
  'inmuebles': 'publications_inmuebles',
  'vehiculos': 'publications_vehiculos',
  'servicios': 'publications_servicios',
  'productos': 'publications_productos',
  'eventos': 'publications_eventos',
  'negocios': 'publications_negocios',
  'comunidad': 'publications_comunidad'
};

// Sample data for empty collections
const SAMPLE_PUBLICATIONS: Record<string, PublicationData[]> = {
  'vehiculos': [
    {
      id: 'sample_vehiculo_1',
      title: 'Toyota Corolla 2022 - Excelente estado',
      description: 'Vendo Toyota Corolla 2022 con apenas 15,000 km. Único dueño, mantenimiento al día, todos los servicios en concesionario.',
      price: 18500,
      currency: 'USD',
      category: 'vehiculos',
      subcategory: 'autos',
      location: { city: 'Lima', region: 'Lima' },
      contactName: 'Carlos Mendoza',
      contactPhone: '+51 987 654 321',
      status: 'active',
      images: ['/images/sample/toyota-corolla.jpg'],
      created_at: new Date().toISOString()
    },
    {
      id: 'sample_vehiculo_2',
      title: 'Honda CBR 250R - Impecable',
      description: 'Vendo Honda CBR 250R con 8,000 km. Documentos en regla, mantenimiento recién hecho.',
      price: 3800,
      currency: 'USD',
      category: 'vehiculos',
      subcategory: 'motos',
      location: { city: 'Arequipa', region: 'Arequipa' },
      contactName: 'Laura Torres',
      contactPhone: '+51 923 456 789',
      status: 'active',
      images: ['/images/sample/honda-cbr.jpg'],
      created_at: new Date().toISOString()
    }
  ],
  'inmuebles': [
    {
      id: 'sample_inmueble_1',
      title: 'Departamento en Miraflores - 3 dormitorios',
      description: 'Hermoso departamento en el corazón de Miraflores. 3 dormitorios, 2 baños, cocina equipada, sala-comedor amplia. Edificio con ascensor y seguridad 24/7.',
      price: 850,
      currency: 'USD',
      category: 'inmuebles',
      subcategory: 'departamentos',
      location: { city: 'Lima', region: 'Miraflores' },
      contactName: 'María Sánchez',
      contactPhone: '+51 912 345 678',
      status: 'active',
      images: ['/images/sample/departamento-miraflores.jpg'],
      created_at: new Date().toISOString()
    }
  ],
  'empleos': [
    {
      id: 'sample_empleo_1',
      title: 'Desarrollador Full Stack React/Node.js',
      description: 'Importante empresa de tecnología busca desarrollador Full Stack con experiencia en React, Node.js y bases de datos NoSQL. Modalidad remota, excelente remuneración y beneficios.',
      price: 0,
      currency: 'PEN',
      category: 'empleos',
      subcategory: 'tecnologia',
      location: { city: 'Lima', region: 'Remoto' },
      contactName: 'Recursos Humanos',
      contactEmail: 'rrhh@empresa.com',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ]
};

// Fallback data for when DB queries fail
const FALLBACK_PUBLICATIONS: PublicationData[] = [
  {
    id: 'fallback_1',
    title: 'Ejemplo: Departamento en alquiler',
    description: 'Este es un anuncio de ejemplo que se muestra cuando hay problemas de conexión.',
    price: 850,
    currency: 'PEN',
    category: 'inmuebles',
    subcategory: 'departamentos',
    location: { city: 'Lima', region: 'Lima' },
    contactName: 'Ejemplo',
    status: 'active',
    images: ['/images/placeholder-image.jpg'],
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback_2',
    title: 'Ejemplo: Servicio de desarrollo web',
    description: 'Este es un anuncio de ejemplo que se muestra cuando hay problemas con la base de datos.',
    price: 500,
    currency: 'PEN',
    category: 'servicios',
    subcategory: 'tecnologia',
    location: { city: 'Online', region: 'Nacional' },
    contactName: 'Ejemplo',
    status: 'active',
    images: ['/images/placeholder-image.jpg'],
    created_at: new Date().toISOString()
  }
];

// Function to seed collections with sample data if they're empty
async function seedCollectionIfEmpty(collectionName: string): Promise<void> {
  try {
    logDebug(`Checking if ${collectionName} needs to be seeded`);
    const data = await mongoDbQuery<PublicationData>(collectionName, {}, { limit: 1 });
    
    if (data.length === 0) {
      logDebug(`Collection ${collectionName} is empty, seeding with sample data`);
      const category = collectionName.replace('publications_', '');
      
      if (SAMPLE_PUBLICATIONS[category]) {
        const samples = SAMPLE_PUBLICATIONS[category];
        
        for (const sample of samples) {
          await mongoDbInsert<PublicationData>(collectionName, sample);
        }
        
        logDebug(`Seeded ${samples.length} documents into ${collectionName}`);
      } else {
        logDebug(`No sample data available for ${category}`);
      }
    } else {
      logDebug(`Collection ${collectionName} already has data, no seeding needed`);
    }
  } catch (error) {
    logError(`Error seeding collection ${collectionName}`, error);
    // Don't throw, just log the error
  }
}

export async function GET(request: Request) {
  try {
    logDebug('GET /api/publications received');
    const { searchParams } = new URL(request.url);
    
    // Log request parameters
    logDebug('Search parameters:', Object.fromEntries(searchParams.entries()));
    
    // Extract query parameters
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sortBy') || 'recent';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Build MongoDB query
    const mongoQuery: MongoQuery = {};
    
    if (subcategory) mongoQuery.subcategory = subcategory;
    
    if (query) {
      mongoQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (location) {
      mongoQuery['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      mongoQuery.price = {};
      if (minPrice) mongoQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) mongoQuery.price.$lte = parseFloat(maxPrice);
    }
    
    // Sort options
    const sortOptions: SortOptions = {};
    switch (sortBy) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'recent':
      default:
        sortOptions.created_at = -1;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Determine which collection(s) to search
    let data: PublicationData[] = [];
    let totalCount = 0;
    
    try {
      if (category && CATEGORY_COLLECTIONS[category]) {
        // Search in specific category collection
        const collectionName = CATEGORY_COLLECTIONS[category];
        logDebug(`Searching in specific collection: ${collectionName}`);
        
        try {
          // Try to seed the collection if empty - only on first page request
          if (page === 1) {
            await seedCollectionIfEmpty(collectionName);
          }
          
          // Query the collection
          data = await mongoDbQuery<PublicationData>(collectionName, mongoQuery, {
            sort: sortOptions,
            skip,
            limit
          });
          
          logDebug(`Retrieved ${data.length} results from ${collectionName}`);
          
          // Get total count for pagination from the same collection
          const countData = await mongoDbQuery<PublicationData>(collectionName, mongoQuery, {});
          totalCount = countData.length;
          logDebug(`Total count: ${totalCount}`);
          
          // If we still have no results, use sample data
          if (data.length === 0 && page === 1) {
            logDebug(`No results found in ${collectionName}, using sample data`);
            
            if (SAMPLE_PUBLICATIONS[category]) {
              data = SAMPLE_PUBLICATIONS[category];
              totalCount = data.length;
              logDebug(`Using ${data.length} sample publications for ${category}`);
            } else {
              data = FALLBACK_PUBLICATIONS;
              totalCount = FALLBACK_PUBLICATIONS.length;
              logDebug(`Using fallback publications`);
            }
          }
        } catch (error) {
          logError(`Error querying ${collectionName}`, error);
          
          // Use sample or fallback data
          if (SAMPLE_PUBLICATIONS[category]) {
            data = SAMPLE_PUBLICATIONS[category];
            totalCount = data.length;
            logDebug(`Using ${data.length} sample publications for ${category} after error`);
          } else {
            data = FALLBACK_PUBLICATIONS;
            totalCount = FALLBACK_PUBLICATIONS.length;
            logDebug(`Using fallback publications after error`);
          }
        }
      } else {
        // Search in all collections if no specific category
        logDebug('Searching across all collections');
        
        const promises = Object.entries(CATEGORY_COLLECTIONS).map(async ([categoryKey, collection]) => {
          try {
            // Try to seed the collection if empty - only on first page request
            if (page === 1) {
              await seedCollectionIfEmpty(collection);
            }
            
            const results = await mongoDbQuery<PublicationData>(collection, mongoQuery, {
              sort: sortOptions,
              skip: 0,
              limit: 500
            });
            
            logDebug(`Retrieved ${results.length} results from ${collection}`);
            return results;
          } catch (error) {
            logError(`Error querying collection ${collection}`, error);
            return []; // Return empty for this collection
          }
        });
        
        const allResults = await Promise.all(promises);
        const combinedResults = allResults.flat(); // Combine all results
        
        // If we have no results at all, use mixed sample data
        if (combinedResults.length === 0) {
          logDebug('No results found across collections, using mixed sample data');
          
          // Combine sample data from all categories
          const mixedSamples: PublicationData[] = [];
          for (const categorySamples of Object.values(SAMPLE_PUBLICATIONS)) {
            mixedSamples.push(...categorySamples);
          }
          
          if (mixedSamples.length > 0) {
            data = mixedSamples;
            totalCount = mixedSamples.length;
            logDebug(`Using ${data.length} mixed sample publications`);
          } else {
            data = FALLBACK_PUBLICATIONS;
            totalCount = FALLBACK_PUBLICATIONS.length;
            logDebug(`Using fallback publications`);
          }
        } else {
          // Sort the combined results
          combinedResults.sort((a, b) => {
            if (sortBy === 'price_asc') {
              return (a.price || 0) - (b.price || 0);
            } else if (sortBy === 'price_desc') {
              return (b.price || 0) - (a.price || 0);
            } else {
              // Default sort by date
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            }
          });
          
          // Apply pagination to the combined results
          totalCount = combinedResults.length;
          data = combinedResults.slice(skip, skip + limit);
          logDebug(`Retrieved ${data.length} total results after combining and pagination`);
        }
      }
    } catch (error) {
      logError('Error in MongoDB operations', error);
      
      // Use appropriate fallback data
      if (category && SAMPLE_PUBLICATIONS[category]) {
        data = SAMPLE_PUBLICATIONS[category];
        totalCount = data.length;
        logDebug(`Using ${data.length} sample publications for ${category} after global error`);
      } else {
        data = FALLBACK_PUBLICATIONS;
        totalCount = FALLBACK_PUBLICATIONS.length;
        logDebug(`Using fallback publications after global error`);
      }
    }
    
    // Ensure all publications have valid location format
    data = data.map(pub => {
      if (!pub.location) {
        pub.location = { city: 'No especificada', region: '' };
      }
      
      // Make sure createdAt or created_at exists
      if (!pub.created_at && pub.createdAt) {
        pub.created_at = pub.createdAt;
      } else if (!pub.created_at) {
        pub.created_at = new Date().toISOString();
      }
      
      return pub;
    });
    
    logDebug(`Returning ${data.length} publications to client`);
    
    return NextResponse.json({
      publications: data,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      page
    });
  } catch (error) {
    logError('Fatal error in publications API', error);
    
    // Always return something to the client, never a 500
    return NextResponse.json({
      publications: FALLBACK_PUBLICATIONS,
      total: FALLBACK_PUBLICATIONS.length,
      pages: 1,
      page: 1,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorFriendly: 'No pudimos conectar con la base de datos. Mostrando datos de ejemplo.'
    });
  }
}

export async function POST(request: Request) {
  try {
    logDebug('POST /api/publications received');
    
    const data = await request.json();
    logDebug('Received publication data', data);
    
    if (!data.title || !data.description) {
      logDebug('Missing required fields: title or description');
      return NextResponse.json(
        { error: 'El título y la descripción son obligatorios' },
        { status: 400 }
      );
    }
    
    // Determine collection based on category
    const categorySlug = data.category || 'inmuebles';
    if (!CATEGORY_COLLECTIONS[categorySlug]) {
      logDebug(`Invalid category: ${categorySlug}`);
      return NextResponse.json(
        { error: 'Categoría no válida' },
        { status: 400 }
      );
    }
    
    const collectionName = CATEGORY_COLLECTIONS[categorySlug];
    
    // Ensure proper location format
    if (typeof data.location === 'string') {
      data.location = {
        city: data.location,
        region: ''
      };
    } else if (!data.location) {
      data.location = {
        city: 'No especificada',
        region: ''
      };
    }
    
    const now = new Date();
    const publicationData: PublicationData = {
      ...data,
      id: data.id || `pub_${Date.now()}`, // Generate ID if not provided
      status: 'active',
      created_at: now,
      updated_at: now
    };
    
    try {
      // Save the publication using server-side MongoDB utility
      const result = await mongoDbInsert<PublicationData>(collectionName, publicationData);
      logDebug(`Publication created successfully in ${collectionName}`, { id: publicationData.id });
      
      return NextResponse.json({ 
        success: true,
        id: publicationData.id
      });
    } catch (error) {
      logError('Error creating publication', error);
      return NextResponse.json(
        { 
          error: `Error al guardar la publicación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          errorFriendly: 'No pudimos guardar tu publicación. Por favor, intenta nuevamente más tarde.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logError('Error processing publication data', error);
    return NextResponse.json(
      { 
        error: `Error al procesar los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        errorFriendly: 'No pudimos procesar tu solicitud. Por favor, verifica los datos e intenta nuevamente.'
      },
      { status: 400 }
    );
  }
} 