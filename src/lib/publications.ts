import { getMongoClient } from '@/lib/mongodb-server';
import { PublicationData } from '@/types/publication';
import { ObjectId } from 'mongodb';

export async function getPublicationBySlugOrId(identifier: string): Promise<PublicationData | null> {
  console.log('🔍 getPublicationBySlugOrId called with:', identifier);
  const cleanIdentifier = (identifier || '').trim();
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB || 'buscadis');
  const collection = db.collection('adisos');

  let publication: Record<string, unknown> | null = null;

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
  const pub = publication as Record<string, unknown>;
  const pricing = pub.pricing as Record<string, unknown> | undefined;
  const location = pub.location as Record<string, string> | undefined;
  const contact = pub.contact as Record<string, string> | undefined;
  const attributes = pub.attributes as Record<string, unknown> | undefined;
  const statistics = pub.statistics as Record<string, number> | undefined;
  
  const normalizedPublication: PublicationData = {
    id: (pub._id as ObjectId).toString(),
    sequentialId: pub.sequentialId as number | undefined,
    title: pub.title as string,
    description: pub.description as string,
    categorySlug: pub.category as string,
    subcategorySlug: (pub.subcategory as string | null | undefined) || null,
    subSubcategorySlug: (pub.subsubcategory as string | null | undefined) || null,
    transactionType: pub.transactionType as string,
    value: (pricing?.price as number) || 0,
    currency: (pricing?.currency as string) || 'USD',
    valueType: (pricing?.priceType as string) || 'exact',
    size: (attributes?.area as number) || 0,
    location: {
      reference: location?.address,
      district: location?.district || '',
      province: location?.province || '',
      city: location?.city || '',
      country: location?.country || '',
    },
    images: (pub.images as string[]) || [],
    whatsapp: contact?.phone || '',
    createdAt: (pub.createdAt as Date)?.toISOString() || new Date().toISOString(),
    updatedAt: (pub.updatedAt as Date)?.toISOString(),
    views: statistics?.views || 0,
    featured: pub.isFeatured as boolean | undefined,
    premium: pub.isPremium as boolean | undefined,
    attributes: attributes,
  };

  return normalizedPublication;
}
