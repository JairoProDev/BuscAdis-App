import { getMongoClient } from '@/lib/mongodb-server';
import { PublicationData } from '@/types/publication';
import { ObjectId } from 'mongodb';

export async function getPublicationBySlugOrId(identifier: string): Promise<PublicationData | null> {
  console.log('🔍 getPublicationBySlugOrId called with:', identifier);
  const cleanIdentifier = (identifier || '').trim();
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB || 'buscadis');
  const collection = db.collection('adisos');

  let publication: any = null;

  // 1) Try by Mongo ObjectId
  if (ObjectId.isValid(cleanIdentifier)) {
    console.log('🔍 Trying ObjectId search for:', cleanIdentifier);
    try {
      publication = await collection.findOne({ _id: new ObjectId(cleanIdentifier) });
      console.log('🔍 ObjectId search result:', publication ? 'FOUND' : 'NOT FOUND');
    } catch (error) {
      console.log('🔍 ObjectId search error:', error);
    }
  }

  // 2) Try by sequentialId (numeric)
  if (!publication && !isNaN(parseInt(cleanIdentifier, 10))) {
    console.log('🔍 Trying sequentialId search for:', cleanIdentifier);
    publication = await collection.findOne({ sequentialId: parseInt(cleanIdentifier, 10) });
    console.log('🔍 sequentialId search result:', publication ? 'FOUND' : 'NOT FOUND');
  }

  // 3) Try by slug
  if (!publication) {
    console.log('🔍 Trying slug search for:', cleanIdentifier);
    publication = await collection.findOne({ slug: cleanIdentifier });
    console.log('🔍 slug search result:', publication ? 'FOUND' : 'NOT FOUND');
  }

  // 4) Try by plain string id field
  if (!publication) {
    console.log('🔍 Trying string id search for:', cleanIdentifier);
    publication = await collection.findOne({ id: cleanIdentifier });
    console.log('🔍 string id search result:', publication ? 'FOUND' : 'NOT FOUND');
  }

  if (!publication) {
    return null;
  }

  // Normalize the data to match PublicationData type
  const normalizedPublication: PublicationData = {
    id: publication._id.toString(),
    sequentialId: publication.sequentialId,
    title: publication.title,
    description: publication.description,
    categorySlug: publication.category,
    subcategorySlug: publication.subcategory,
    subSubcategorySlug: publication.subsubcategory,
    transactionType: publication.transactionType,
    value: publication.pricing?.price || 0,
    currency: publication.pricing?.currency || 'USD',
    valueType: publication.pricing?.priceType || 'exact',
    size: publication.attributes?.area || 0,
    location: {
      reference: publication.location?.address,
      district: publication.location?.district || '',
      province: publication.location?.province || '',
      city: publication.location?.city || '',
      country: publication.location?.country || '',
    },
    images: publication.images || [],
    whatsapp: publication.contact?.phone || '',
    createdAt: publication.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: publication.updatedAt?.toISOString(),
    views: publication.statistics?.views || 0,
    featured: publication.isFeatured,
    premium: publication.isPremium,
    attributes: publication.attributes,
  };

  return normalizedPublication;
}
