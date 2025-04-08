import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '@/features/auth/services/auth.service';
import getMongoClient from '@/lib/mongodb';
import { Logger } from '@/services/logging.service';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

interface MediaItem {
    url: string;
    type: string;
}

interface Location {
    district?: { id: string; name: string };
    region?: { id: string; name: string };
    coordinates?: { lat: number; lon: number } | null;
    city?: string;
    country?: string;
}

interface Price {
    amount: number;
    currency: string;
    type: string;
}

export interface QuickPublicationData {
    title: string;
    description: string;
    category?: { id: string; name: string; subcategories?: Array<{ id: string; name: string; selected?: boolean }> };
    type?: string;
    contact: { whatsapp: string; email?: string };
    media: MediaItem[];
    location?: Location;
    price?: Price;
    priceType?: string;
}

interface PublicationParams {
    category?: string;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    sortBy?: string;
    page: number;
    limit?: number;
}

export class PublicationsService {
    private static async getCollection(category?: string) {
        try {
            const client = await getMongoClient();
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
        } catch (error) {
            Logger.error('Error getting MongoDB collection', { error, category });
            if (isBrowser) {
                // Return a mock collection for client-side rendering
                return {
                    find: () => ({ toArray: async () => [] }),
                    findOne: async () => null,
                    insertOne: async () => ({ acknowledged: true, insertedId: 'mock-id' }),
                    updateOne: async () => ({ modifiedCount: 1 }),
                    deleteOne: async () => ({ deletedCount: 1 }),
                    countDocuments: async () => 0
                };
            } else {
                throw error;
            }
        }
    }

    static async createPublication(data: QuickPublicationData): Promise<{ id: string }> {
        if (isBrowser) {
            Logger.info('Using client-side mock for createPublication');
            // Return a mock response for client-side
            return { id: uuidv4() };
        }
        
        try {
            if (!data.title || !data.description) {
                throw new Error('El título y la descripción son obligatorios');
            }

            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const publicationId = uuidv4();
            // Get the appropriate collection based on category
            const category = data.category?.id || 'inmuebles';
            const publications = await this.getCollection(category);
            
            const result = await publications.insertOne({
                id: publicationId,
                userId: currentUser.id,
                title: data.title,
                description: data.description,
                price: data.price?.amount || 0,
                priceType: data.price?.type || 'fixed',
                categorySlug: data.category?.id || 'inmuebles',
                categoryName: data.category?.name || 'Inmuebles',
                location: data.location?.city || '',
                contactName: 'Propietario',
                contactPhone: data.contact?.whatsapp || '',
                currency: data.price?.currency || 'PEN',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            return { id: publicationId };
        } catch (error) {
            Logger.error('Error creating publication:', { error });
            throw error;
        }
    }

    static async getPublicationById(id: string, category?: string): Promise<any> {
        try {
            const publications = await this.getCollection(category);
            return await publications.findOne({ id });
        } catch (error) {
            Logger.error('Error getting publication:', { error });
            throw error;
        }
    }

    static async getPublicationsByUser(userId: string): Promise<any[]> {
        if (isBrowser) {
            Logger.info('Using client-side mock for getPublicationsByUser');
            // Return mock data for client-side
            return [];
        }
        
        try {
            // We need to search in all collections
            const client = await getMongoClient();
            const db = client.db('test');
            
            // Get publications from each collection
            const inmuebles = await db.collection('publications_inmuebles').find({ userId }).toArray();
            const empleos = await db.collection('publications_empleos').find({ userId }).toArray();
            const servicios = await db.collection('publications_servicios').find({ userId }).toArray();
            const vehiculos = await db.collection('publications_vehiculos').find({ userId }).toArray();
            
            // Combine and return all results
            return [...inmuebles, ...empleos, ...servicios, ...vehiculos];
        } catch (error) {
            Logger.error('Error getting user publications:', { error });
            throw error;
        }
    }

    static async getPublications(params: PublicationParams): Promise<{ publications: any[], total: number, pages: number }> {
        try {
            const publications = await this.getCollection(params.category);
            const filter: Record<string, any> = {
                // Default to active listings
                status: "active"
            };
            
            if (params.query) {
                filter.$or = [
                    { title: { $regex: params.query, $options: 'i' } },
                    { description: { $regex: params.query, $options: 'i' } }
                ];
            }
            
            if (params.minPrice) {
                filter.price = filter.price || {};
                filter.price.$gte = Number(params.minPrice);
            }
            
            if (params.maxPrice) {
                filter.price = filter.price || {};
                filter.price.$lte = Number(params.maxPrice);
            }
            
            if (params.location) {
                filter.location = { $regex: params.location, $options: 'i' };
            }

            // Count total documents for pagination
            const totalCount = await publications.countDocuments(filter);
            
            // Set up sort options
            let sortOptions: Record<string, number> = { createdAt: -1 }; // Default sort by date desc
            
            if (params.sortBy) {
                switch (params.sortBy) {
                    case 'price_asc':
                        sortOptions = { price: 1 };
                        break;
                    case 'price_desc':
                        sortOptions = { price: -1 };
                        break;
                    case 'date_desc':
                        sortOptions = { createdAt: -1 };
                        break;
                    case 'date_asc':
                        sortOptions = { createdAt: 1 };
                        break;
                }
            }
            
            // Get paginated results
            const limit = params.limit || 20;
            const skip = (params.page - 1) * limit;
            
            const items = await publications
                .find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .toArray();
            
            return {
                publications: items,
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
            };
        } catch (error) {
            Logger.error('Error getting publications:', { error });
            // Return empty results rather than failing completely
            return {
                publications: [],
                total: 0,
                pages: 0
            };
        }
    }

    static async updatePublication(id: string, data: Partial<QuickPublicationData>): Promise<any> {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }
            
            // Find which collection contains this publication
            const collections = ['inmuebles', 'empleos', 'servicios', 'vehiculos'];
            let publication = null;
            let categoryFound = null;
            
            for (const category of collections) {
                publication = await this.getPublicationById(id, category);
                if (publication) {
                    categoryFound = category;
                    break;
                }
            }
            
            if (!publication) {
                throw new Error('Anuncio no encontrado');
            }
            
            if (publication.userId !== currentUser.id) {
                throw new Error('No tienes permiso para editar este anuncio');
            }
            
            const updateData: Record<string, any> = {
                updatedAt: new Date().toISOString()
            };
            
            if (data.title) {
                updateData.title = data.title;
            }
            
            if (data.description) {
                updateData.description = data.description;
            }
            
            if (data.price) {
                updateData.price = data.price.amount;
                updateData.priceType = data.price.type;
                if (data.price.currency) {
                    updateData.currency = data.price.currency;
                }
            }

            if (data.category) {
                updateData.categorySlug = data.category.id;
                updateData.categoryName = data.category.name;
            }
            
            if (data.contact) {
                updateData.contactPhone = data.contact.whatsapp;
            }
            
            if (data.media) {
                updateData.images = data.media;
            }
            
            if (data.location) {
                updateData.location = data.location.city || '';
            }
            
            const publications = await this.getCollection(categoryFound);
            const result = await publications.updateOne(
                { id },
                { $set: updateData }
            );
            
            if (result.modifiedCount === 0) {
                throw new Error('No se pudo actualizar el anuncio');
            }
            
            return await this.getPublicationById(id, categoryFound);
        } catch (error) {
            console.error('Error updating publication:', error);
            throw error;
        }
    }

    static async deletePublication(id: string): Promise<{ success: boolean }> {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                throw new Error('Usuario no autenticado');
            }
            
            // Find which collection contains this publication
            const collections = ['inmuebles', 'empleos', 'servicios', 'vehiculos'];
            let publication = null;
            let categoryFound = null;
            
            for (const category of collections) {
                publication = await this.getPublicationById(id, category);
                if (publication) {
                    categoryFound = category;
                    break;
                }
            }
            
            if (!publication) {
                throw new Error('Anuncio no encontrado');
            }
            
            if (publication.userId !== currentUser.id) {
                throw new Error('No tienes permiso para eliminar este anuncio');
            }
            
            const publications = await this.getCollection(categoryFound);
            const result = await publications.deleteOne({ id });
            
            if (result.deletedCount === 0) {
                throw new Error('No se pudo eliminar el anuncio');
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting publication:', error);
            throw error;
        }
    }

    static async getAllPublications(): Promise<any[]> {
        try {
            const client = await getMongoClient();
            const db = client.db('test');
            
            // Get publications from each collection
            const inmuebles = await db.collection('publications_inmuebles').find({}).toArray();
            const empleos = await db.collection('publications_empleos').find({}).toArray();
            const servicios = await db.collection('publications_servicios').find({}).toArray();
            const vehiculos = await db.collection('publications_vehiculos').find({}).toArray();
            
            // Combine and return all results
            return [...inmuebles, ...empleos, ...servicios, ...vehiculos];
        } catch (error) {
            console.error('Error getting all publications:', error);
            throw error;
        }
    }
}