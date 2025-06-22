import { NextResponse } from 'next/server'
import { getServerMongoClient } from '@/lib/mongodb-server'
import { Logger } from '@/services/logging.service'

export const dynamic = 'force-dynamic' // Disable caching to ensure data is always fresh
export const runtime = 'nodejs' // Mark as server-side only

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

// Interface for raw data structure from API (might include _id, etc.)
interface ApiPublicationData {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  price?: number | string;
  currency?: string;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  location?: { city?: string; region?: string } | string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  created_at?: string | Date;
  createdAt?: string | Date;
  images?: string[];
  premium?: boolean;
  verified?: boolean;
  [key: string]: unknown;
}

interface MongoQuery {
  subcategory?: string;
  $or?: Array<{ [key: string]: unknown }>;
  'location.city'?: { $regex: string; $options: string };
  price?: { $gte?: number; $lte?: number };
  [key: string]: unknown;
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

// Fallback for absolute failure
const ABSOLUTE_FALLBACK = [{ 
  id: 'error', 
  title: 'Error al cargar', 
  description: 'No se pudieron cargar los anuncios.', 
  price: 0, 
  currency: 'PEN', 
  categorySlug: 'error', 
  location: 'Error', 
  contactName: '', 
  status: 'error', 
  createdAt: new Date().toISOString() 
}];

// Function to seed collections with sample data if they're empty
async function seedCollectionIfEmpty(collectionName: string): Promise<void> {
  try {
    // Check only if it hasn't been checked recently
    if (checkedCollections.has(collectionName)) {
      Logger.debug(`Skipping seed check for ${collectionName}, already checked.`);
      return;
    }

    Logger.debug(`Checking if ${collectionName} needs to be seeded`);
    const data = await mongoDbQuery<ApiPublicationData>(collectionName, {}, { limit: 1 });
    checkedCollections.add(collectionName); // Mark as checked

    const isEmpty = !data || (Array.isArray(data) && data.length === 0);

    if (isEmpty) {
      Logger.debug(`Collection ${collectionName} is empty, attempting to seed...`);
      const category = collectionName.replace('publications_', '');
      const samples = SAMPLE_PUBLICATIONS[category];

      if (samples && samples.length > 0) {
        Logger.debug(`Found ${samples.length} samples for ${category}. Seeding...`);
        for (const sample of samples) {
          const preparedSample = { 
            ...sample, 
            id: sample.id || `sample_${category}_${Math.random().toString(36).substring(2, 9)}`, 
            created_at: sample.created_at || new Date() 
          };
          await mongoDbInsert<ApiPublicationData>(collectionName, preparedSample as Record<string, unknown>);
        }
        Logger.debug(`Seeded ${samples.length} documents into ${collectionName}`);
      } else {
        Logger.debug(`No sample data defined for category: ${category}`);
      }
    } else {
      Logger.debug(`Collection ${collectionName} already has data, no seeding needed`);
    }
  } catch (error) {
    Logger.error(`Error seeding collection ${collectionName}`, { error });
  }
}

// Keep track of collections checked during this server instance lifetime
const checkedCollections = new Set<string>();

export async function GET(request: Request) {
  try {
    Logger.debug('GET /api/publications received');
    const { searchParams } = new URL(request.url);

    // Log request parameters
    Logger.debug('Search parameters', { params: Object.fromEntries(searchParams.entries()) });

    // Extract query parameters
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sortBy') || 'recent';

    // Build MongoDB query
    const mongoQuery: MongoQuery = {};
    if (subcategory) mongoQuery.subcategory = subcategory;
    if (query) mongoQuery.$or = [
      { title: { $regex: query, $options: 'i' } }, 
      { description: { $regex: query, $options: 'i' } }
    ];
    if (location) mongoQuery['location.city'] = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      mongoQuery.price = {};
      if (minPrice) mongoQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) mongoQuery.price.$lte = parseFloat(maxPrice);
    }

    // Sort options
    let sortOption: Record<string, number> = { created_at: -1 };
    if (sortBy === 'price_asc') sortOption = { price: 1 };
    else if (sortBy === 'price_desc') sortOption = { price: -1 };

    // Determine which collection(s) to search
    let data: ApiPublicationData[] = [];

    try {
      if (category && CATEGORY_COLLECTIONS[category]) {
        // Search in specific category collection
        const collectionName = CATEGORY_COLLECTIONS[category];
        Logger.debug(`Searching in specific collection: ${collectionName}`);
        
        // Seed check only on specific category access
        await seedCollectionIfEmpty(collectionName);
        
        try {
          const results = await mongoDbQuery<ApiPublicationData>(collectionName, mongoQuery as Record<string, unknown>, {
            sort: sortOption,
          });
          data = Array.isArray(results) ? results : [];
          Logger.debug(`Retrieved ${data.length} results from ${collectionName}`);
        } catch (error) {
          Logger.error(`Error querying specific collection ${collectionName}`, { error });
          data = [];
        }
      } else {
        // Search in all collections
        Logger.debug('Searching across all collections');
        
        for (const [cat, collectionName] of Object.entries(CATEGORY_COLLECTIONS)) {
          try {
            const results = await mongoDbQuery<ApiPublicationData>(collectionName, mongoQuery as Record<string, unknown>, {
              sort: sortOption,
            });
            
            if (Array.isArray(results) && results.length > 0) {
              data.push(...results);
            }
          } catch (error) {
            Logger.error(`Error querying collection ${collectionName}`, { error });
          }
        }
        
        // Sort combined results
        data.sort((a, b) => {
          const aDate = new Date(a.created_at || a.createdAt || 0).getTime();
          const bDate = new Date(b.created_at || b.createdAt || 0).getTime();
          return bDate - aDate;
        });
        
        Logger.debug(`Combined and sorted ${data.length} results from all collections`);
      }
    } catch (error) {
      Logger.error('Error in main search logic', { error });
      data = [];
    }

    // Validate and clean data
    const validatedData = data.filter((item): item is ApiPublicationData => {
      return item && typeof item === 'object' && 
             typeof item.title === 'string' && 
             typeof item.description === 'string';
    }).map(item => ({
      ...item,
      id: item.id || item._id?.toString() || 'unknown',
      categorySlug: item.categorySlug || item.category || category,
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    }));

    Logger.debug(`Returning ${validatedData.length} validated publications to client`);

    return NextResponse.json({
      publications: validatedData,
      total: validatedData.length,
      page: 1,
      pages: 1,
      success: true
    });

  } catch (error) {
    Logger.error('Critical error in GET /api/publications', { error });
    
    return NextResponse.json({
      publications: ABSOLUTE_FALLBACK,
      total: 1,
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
      Logger.debug('Missing required fields: title or description');
      return NextResponse.json(
        { error: 'Título y descripción son requeridos' },
        { status: 400 }
      );
    }

    const categorySlug = data.categorySlug;
    if (!categorySlug || !CATEGORY_COLLECTIONS[categorySlug]) {
      Logger.debug(`Invalid category: ${categorySlug}`);
      return NextResponse.json(
        { error: 'Categoría inválida' },
        { status: 400 }
      );
    }

    const collectionName = CATEGORY_COLLECTIONS[categorySlug];
    
    // Prepare publication data
    const publicationData = {
      ...data,
      id: data.id || `pub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: data.status || 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Insert into appropriate collection
    try {
      await mongoDbInsert(collectionName, publicationData);
      Logger.debug(`Publication created successfully in ${collectionName}`, { id: publicationData.id });

      return NextResponse.json({
        success: true,
        publication: publicationData,
        message: 'Publicación creada exitosamente'
      });
    } catch (insertError) {
      Logger.error('Error inserting publication', { error: insertError, collectionName });
      return NextResponse.json(
        { error: 'Error al crear la publicación' },
        { status: 500 }
      );
    }

  } catch (error) {
    Logger.error('Critical error in POST /api/publications', { error });
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Sample publications for seeding (abbreviated)
const SAMPLE_PUBLICATIONS: { [key: string]: any[] } = {
  empleos: [
    {
      title: "Desarrollador Full Stack",
      description: "Buscamos desarrollador con experiencia en React y Node.js",
      price: 3000,
      currency: "PEN",
      location: { city: "Cusco", region: "Cusco" },
      status: "active"
    }
  ],
  inmuebles: [
    {
      title: "Casa en San Blas",
      description: "Hermosa casa colonial en el corazón de San Blas",
      price: 450000,
      currency: "PEN", 
      location: { city: "Cusco", region: "Cusco" },
      status: "active"
    }
  ]
}; 