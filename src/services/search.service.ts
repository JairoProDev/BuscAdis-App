import clientPromise from '@/lib/mongodb';

// Check for MongoDB URI
if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined.');
}

interface SearchPublicationsParams {
    query?: string;
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
}

interface SearchResults {
    publications: unknown[];
    total: number;
    pages: number;
}

interface MongoFilter {
    status?: string;
    $or?: Array<{
        title?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
        location?: { $regex: string; $options: string };
    }>;
    categorySlug?: string;
    price?: {
        $gte?: number;
        $lte?: number;
    };
}

interface SortOptions {
    createdAt?: number;
    price?: number;
    [key: string]: number | undefined;
}

export class SearchService {
    private static async getCollection(category?: string) {
        const client = await clientPromise;
        const db = client.db('test');
        
        // Use the right collection based on category, default to inmuebles
        if (category === 'empleos') {
            return db.collection('publications_empleos');
        } else if (category === 'servicios') {
            return db.collection('publications_servicios');
        } else if (category === 'vehiculos') {
            return db.collection('publications_vehiculos');
        } else {
            return db.collection('publications_inmuebles');
        }
    }

    static async searchPublications(params: SearchPublicationsParams): Promise<SearchResults> {
        const { page = 1, limit = 20 } = params;

        try {
            const publications = await this.getCollection(params.category);
            
            console.log("Filters received:", params); // Log of received filters
            
            // Build filter object
            const filter: MongoFilter = { 
                // Default to active listings
                status: "active"
            };
            
            if (params.query) {
                filter.$or = [
                    { title: { $regex: params.query, $options: 'i' } },
                    { description: { $regex: params.query, $options: 'i' } }
                ];
            }
            
            if (params.category) {
                filter.categorySlug = params.category;
            }
            
            if (params.location) {
                if (!filter.$or) filter.$or = [];
                filter.$or.push(
                    { location: { $regex: params.location, $options: 'i' } }
                );
            }
            
            if (params.minPrice) {
                filter.price = filter.price || {};
                filter.price.$gte = Number(params.minPrice);
            }
            
            if (params.maxPrice) {
                filter.price = filter.price || {};
                filter.price.$lte = Number(params.maxPrice);
            }
            
            // Count total matching documents
            const total = await publications.countDocuments(filter);
            
            // Set up sort options
            let sortOptions: SortOptions = { createdAt: -1 }; // Default: newest first
            
            if (params.sortBy) {
                switch (params.sortBy) {
                    case 'price_asc':
                        sortOptions = { price: 1 };
                        break;
                    case 'price_desc':
                        sortOptions = { price: -1 };
                        break;
                    case 'date_asc':
                        sortOptions = { createdAt: 1 };
                        break;
                    case 'date_desc':
                        sortOptions = { createdAt: -1 };
                        break;
                }
            }
            
            // Get paginated results
            const skip = (page - 1) * limit;
            const items = await publications
                .find(filter)
                .sort(sortOptions as Record<string, 1 | -1>)
                .skip(skip)
                .limit(limit)
                .toArray();
            
            console.log("Items found:", items.length); // Log of items found
            
            return {
                publications: items,
                total: total,
                pages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error('Error searching publications:', error);
            throw new Error(`Error searching publications: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}