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

// Sample data for empty collections
const SAMPLE_PUBLICATIONS: Record<string, PublicationData[]> = {
  'vehiculos': [],
  'inmuebles': [],
  'empleos': [],
  'servicios': [],
  'productos': [],
  'eventos': [],
  'negocios': [],
  'comunidad': []
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
  let dbErrorOccurred = false;
  let noResultsFound = false;
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
          // Try to seed ONLY when querying a specific category for the first time (page 1)
          if (page === 1) {
            await seedCollectionIfEmpty(collectionName);
          }
          
          const results = await mongoDbQuery<ApiPublicationData>(collectionName, mongoQuery as Record<string, unknown>, {
            sort: sortOptions,
            skip,
            limit
          });
          data = Array.isArray(results) ? results : [];
          
          const countResults = await mongoDbQuery<ApiPublicationData>(collectionName, mongoQuery as Record<string, unknown>, {});
          totalCount = Array.isArray(countResults) ? countResults.length : 0;
          
          if (data.length === 0) noResultsFound = true;
          logDebug(`Retrieved ${data.length} results from ${collectionName}. Total count: ${totalCount}. Found results: ${!noResultsFound}`);
          
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
          dbErrorOccurred = true;
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
        logDebug('Searching across all collections (no seeding on multi-search)');
        
        const promises = Object.entries(CATEGORY_COLLECTIONS).map(async ([categoryKey, collection]) => {
          try {
            // Don't seed here - seeding happens on specific category requests
            const results = await mongoDbQuery<ApiPublicationData>(collection, mongoQuery as Record<string, unknown>, {
              sort: sortOptions,
              skip: 0, // Get all matching results, paginate later
              limit: 0 // No limit when fetching all for combined sort/pagination
            });
            
            const validResults = Array.isArray(results) ? results : [];
            const processedResults = validResults.map(pub => ({
              ...pub,
              category: categoryKey // Add category key
            }));
            logDebug(`Retrieved ${processedResults.length} results from ${collection}`);
            return processedResults;
          } catch (error) {
             dbErrorOccurred = true; // Mark that at least one query failed
             logError(`Error querying collection ${collection} during multi-search`, error);
             return []; // Return empty for this collection on error
          }
        });
        
        const allResults = await Promise.all(promises);
        const combinedResults = allResults.flat();
        
        if (combinedResults.length === 0) noResultsFound = true;
        
        logDebug(`Combined ${combinedResults.length} results from all collections. Found results: ${!noResultsFound}`);
        
        // Sort the combined results IF we found any
        if (!noResultsFound) {
            combinedResults.sort((a, b) => {
              // Type assertion for safety, assuming structure after filtering
              const pubA = a as ApiPublicationData;
              const pubB = b as ApiPublicationData;
              if (sortBy === 'price_asc') {
                return (Number(pubA.price || 0)) - (Number(pubB.price || 0));
              } else if (sortBy === 'price_desc') {
                return (Number(pubB.price || 0)) - (Number(pubA.price || 0));
              } else {
                // Ensure valid date inputs before creating Date objects
                const dateAValue = pubA.created_at || pubA.createdAt;
                const dateBValue = pubB.created_at || pubB.createdAt;
                const dateA = dateAValue ? new Date(dateAValue).getTime() : 0;
                const dateB = dateBValue ? new Date(dateBValue).getTime() : 0;
                return dateB - dateA; // Sort descending
              }
            });
            
            totalCount = combinedResults.length;
            data = combinedResults.slice(skip, skip + limit);
            logDebug(`Paginated results: ${data.length} out of ${totalCount}`);
        } else {
            // Still set totalCount to 0 if no results were found across DBs
            totalCount = 0;
            data = [];
        }
      }
    } catch (error) {
      dbErrorOccurred = true;
      logError('Generic error during MongoDB operations', error);
      data = [];
      totalCount = 0;
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
    
    // --- Decide final response --- (AFTER all DB attempts)
    let finalData: PublicationData[] = data;
    let finalTotalCount = totalCount;
    let usingSampleData = false;

    // USE SAMPLE/FALLBACK ONLY IF:
    // 1. A DB error occurred OR
    // 2. No results were genuinely found in the DB (noResultsFound is true)
    // AND we are on the first page (don't show samples on page 2+)
    if ((dbErrorOccurred || noResultsFound) && page === 1) {
        logDebug(`Condition met for using sample/fallback data: dbErrorOccurred=${dbErrorOccurred}, noResultsFound=${noResultsFound}, page=${page}`);
        usingSampleData = true;
        if (category && SAMPLE_PUBLICATIONS[category] && SAMPLE_PUBLICATIONS[category].length > 0) {
          finalData = SAMPLE_PUBLICATIONS[category];
          finalTotalCount = finalData.length;
          logDebug(`Using ${finalData.length} SAMPLE publications for category: ${category}`);
        } else if (!category) { // Use mixed samples only if searching ALL categories
            const mixedSamples: PublicationData[] = [];
             for (const [catKey, samples] of Object.entries(SAMPLE_PUBLICATIONS)) {
               if (samples.length > 0) {
                 const categorizedSamples = samples.map(sample => ({ ...sample, category: catKey }));
                 mixedSamples.push(...categorizedSamples);
               }
             }
             if (mixedSamples.length > 0) {
                 finalData = mixedSamples;
                 // Sort mixed samples by date before pagination
                 finalData.sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime());
                 finalTotalCount = finalData.length;
                 // Apply pagination to mixed samples too
                 finalData = finalData.slice(skip, skip + limit);
                 logDebug(`Using ${finalData.length} MIXED SAMPLE publications (paginated from ${finalTotalCount})`);
             } else {
                 finalData = FALLBACK_PUBLICATIONS;
                 finalTotalCount = finalData.length;
                 logDebug('Using FALLBACK publications (no mixed samples defined)');
             }
        } else {
          // Specific category requested, but no samples defined for it
          finalData = FALLBACK_PUBLICATIONS;
          finalTotalCount = finalData.length;
          logDebug(`Using FALLBACK publications for category: ${category} (no specific samples)`);
        }
    }

    // Final mapping and validation (using finalData)
    const validatedData = finalData.map(pub => {
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
        ...pub, // Keep original fields but override below
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
      } as PublicationData; // Still map to intermediate type first
    }).filter(Boolean) as PublicationData[]; // Remove nulls

    logDebug(`Returning ${validatedData.length} publications to client (usingSampleData: ${usingSampleData})`);

    return NextResponse.json({
      publications: validatedData, // Send the finally processed data
      total: finalTotalCount,
      pages: Math.ceil(finalTotalCount / limit),
      page,
      usingSampleData // Let the client know if sample data is used
    });
  } catch (error) {
    logError('Fatal error in publications API', error);
    
    // Always return something to the client, never a 500
    return NextResponse.json({
      publications: FALLBACK_PUBLICATIONS,
      total: FALLBACK_PUBLICATIONS.length,
      pages: 1,
      page: 1,
      usingSampleData: true,
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