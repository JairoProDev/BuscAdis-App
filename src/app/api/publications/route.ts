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

// Interface for raw data structure from API (might include _id, etc.)
interface ApiPublicationData {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  price?: number | string;
  currency?: string;
  category?: string;
  categorySlug?: string; // Ensure this is potentially received
  subcategory?: string;
  location?: { city?: string; region?: string } | string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  created_at?: string | Date;
  createdAt?: string | Date; // API might return this instead
  images?: string[];
  premium?: boolean;
  verified?: boolean;
  [key: string]: unknown; // Allow other fields
}

interface MongoQuery {
  subcategory?: string;
  $or?: Array<{ [key: string]: unknown }>;
  'location.city'?: { $regex: string; $options: string };
  price?: { $gte?: number; $lte?: number };
  // Add index signature to allow compatibility with Record<string, unknown>
  [key: string]: unknown;
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

// Fallback for absolute failure
const ABSOLUTE_FALLBACK = [{ id: 'error', title: 'Error al cargar', description: 'No se pudieron cargar los anuncios.', price: 0, currency: 'PEN', categorySlug: 'error', location: 'Error', contactName: '', status: 'error', createdAt: new Date().toISOString() }];

// Function to seed collections with sample data if they're empty
async function seedCollectionIfEmpty(collectionName: string): Promise<void> {
  try {
    // Check only if it hasn't been checked recently
    if (checkedCollections.has(collectionName)) {
      logDebug(`Skipping seed check for ${collectionName}, already checked.`);
      return;
    }

    logDebug(`Checking if ${collectionName} needs to be seeded`);
    const data = await mongoDbQuery<ApiPublicationData>(collectionName, {}, { limit: 1 });
    checkedCollections.add(collectionName); // Mark as checked

    const isEmpty = !data || (Array.isArray(data) && data.length === 0);

    if (isEmpty) {
      logDebug(`Collection ${collectionName} is empty, attempting to seed...`);
      const category = collectionName.replace('publications_', '');
      const samples = SAMPLE_PUBLICATIONS[category];

      if (samples && samples.length > 0) {
        logDebug(`Found ${samples.length} samples for ${category}. Seeding...`);
        for (const sample of samples) {
          const preparedSample = { ...sample, id: sample.id || `sample_${category}_${Math.random().toString(36).substring(2, 9)}`, created_at: sample.created_at || new Date() };
          // Explicitly cast query object for compatibility
          await mongoDbInsert<ApiPublicationData>(collectionName, preparedSample as Record<string, unknown>);
        }
        logDebug(`Seeded ${samples.length} documents into ${collectionName}`);
      } else {
        logDebug(`No sample data defined for category: ${category}`);
      }
    } else {
      logDebug(`Collection ${collectionName} already has data, no seeding needed`);
    }
  } catch (error) {
    logError(`Error seeding collection ${collectionName}`, error);
  }
}

// Keep track of collections checked during this server instance lifetime
const checkedCollections = new Set<string>();

export async function GET(request: Request) {
  try {
    logDebug('GET /api/publications received');
    const { searchParams } = new URL(request.url);

    // Log request parameters
    logDebug('Search parameters:', Object.fromEntries(searchParams.entries()));

    // Extract query parameters (PAGE and LIMIT are now ignored for fetching)
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sortBy = searchParams.get('sortBy') || 'recent';
    // const page = 1; // No pagination for fetch
    // const limit = 0; // Fetch all

    // Build MongoDB query
    const mongoQuery: MongoQuery = {};
    if (subcategory) mongoQuery.subcategory = subcategory;
    if (query) mongoQuery.$or = [{ title: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }];
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
        // --- Search in specific category collection ---
        const collectionName = CATEGORY_COLLECTIONS[category];
        logDebug(`Searching ALL in specific collection: ${collectionName}`);
        // Seed check only on specific category access
        await seedCollectionIfEmpty(collectionName);
        try {
          const results = await mongoDbQuery<ApiPublicationData>(collectionName, mongoQuery as Record<string, unknown>, {
            sort: sortOption,
            // NO skip, NO limit - fetch all matching
          });
          data = Array.isArray(results) ? results : [];
          logDebug(`Retrieved ${data.length} results from ${collectionName}.`);
        } catch (error) {
          logError(`Error querying specific collection ${collectionName}`, error);
          data = []; // Ensure data is empty on error
        }
      } else {
        // --- Search in all collections ---
        logDebug('Searching ALL across all collections');
        const promises = Object.entries(CATEGORY_COLLECTIONS).map(async ([categoryKey, collection]) => {
          try {
            // Don't seed during multi-search
            const results = await mongoDbQuery<ApiPublicationData>(collection, mongoQuery as Record<string, unknown>, {
              sort: sortOption,
              // NO skip, NO limit
            });
            const validResults = Array.isArray(results) ? results : [];
            return validResults.map(pub => ({ ...pub, category: categoryKey })); // Add category
          } catch (error) {
             logError(`Error querying collection ${collection} during multi-search`, error);
             return [];
          }
        });
        const allResults = await Promise.all(promises);
        data = allResults.flat(); // Combine all results

        // Sort the combined results
        data.sort((a, b) => {
            const pubA = a as ApiPublicationData;
            const pubB = b as ApiPublicationData;
            if (sortBy === 'price_asc') return (Number(pubA.price || 0)) - (Number(pubB.price || 0));
            if (sortBy === 'price_desc') return (Number(pubB.price || 0)) - (Number(pubA.price || 0));
            const dateAValue = pubA.created_at || pubA.createdAt;
            const dateBValue = pubB.created_at || pubB.createdAt;
            const dateA = dateAValue ? new Date(dateAValue).getTime() : 0;
            const dateB = dateBValue ? new Date(dateBValue).getTime() : 0;
            return dateB - dateA;
          });
        logDebug(`Combined and sorted ${data.length} results from all collections.`);
      }
    } catch (error) {
      logError('Generic error during MongoDB operations', error);
      data = []; // Ensure data is empty on error
    }

    // --- Final processing and response ---
    const totalCount = data.length; // Total is simply the count of fetched items
    const usingSampleData = false; // Never using sample data in success path now

    // Final mapping and validation (using data from DB)
    const validatedData = data.map(pub => {
      if (!pub || typeof pub !== 'object') return null;
      const id = pub._id?.toString() || pub.id;
      const title = pub.title;
      if (!id || !title) return null;

      let locationText = '';
      if (typeof pub.location === 'string') locationText = pub.location;
      else if (pub.location && typeof pub.location === 'object') {
         const loc = pub.location as { city?: string; region?: string };
         locationText = loc.city || '';
         if (loc.region && loc.region !== loc.city) {
           locationText += loc.region ? `, ${loc.region}` : '';
         }
       }

      const createdAt = pub.createdAt || pub.created_at || new Date().toISOString();

      return {
        id: String(id),
        title: String(title),
        description: String(pub.description || ''),
        price: Number(pub.price || 0),
        currency: String(pub.currency || 'PEN'),
        categorySlug: String(pub.categorySlug || pub.category || 'unknown'),
        location: locationText || 'Ubicación no especificada',
        contactName: String(pub.contactName || ''),
        status: String(pub.status || 'active'),
        createdAt: typeof createdAt === 'string' ? createdAt : createdAt.toISOString(),
        images: Array.isArray(pub.images) && pub.images.length > 0 ? pub.images.map(String) : ['/images/placeholder-image.jpg'],
        premium: Boolean(pub.premium || false),
        verified: Boolean(pub.verified || false),
        subcategory: typeof pub.subcategory === 'string' ? pub.subcategory : undefined,
        subsubcategory: typeof pub.subsubcategory === 'string' ? pub.subsubcategory : undefined,
        contactPhone: typeof pub.contactPhone === 'string' ? pub.contactPhone : undefined,
      } as ApiPublicationData;
    }).filter(Boolean) as ApiPublicationData[];

    logDebug(`Returning ${validatedData.length} REAL publications to client.`);

    // Return REAL data or an empty array. Fallback only happens in final catch.
    return NextResponse.json({
      publications: validatedData,
      total: totalCount,
      pages: 1,
      page: 1,
      usingSampleData
    });

  } catch (error) {
     // FATAL ERROR CATCH
     logError('Fatal error in publications API', error);
     return NextResponse.json({
       publications: ABSOLUTE_FALLBACK, // Use minimal fallback on complete failure
       total: 0,
       pages: 1,
       page: 1,
       usingSampleData: true, // Indicate this is fallback
       error: error instanceof Error ? error.message : 'Unknown error',
       errorFriendly: 'Error crítico al obtener anuncios. Intente más tarde.'
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
      // Explicitly cast data for compatibility
      await mongoDbInsert<ApiPublicationData>(collectionName, publicationData as Record<string, unknown>);
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