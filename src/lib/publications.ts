import connectToDatabase from '@/lib/mongodb';
import { PublicationData } from '@/types/publication';

export async function getPublicationBySlugOrId(identifier: string): Promise<PublicationData | null> {
  const client = await connectToDatabase;
  const db = client.db();
  
  const isSequentialId = !isNaN(parseInt(identifier, 10));
  
  const query = isSequentialId 
    ? { sequentialId: parseInt(identifier, 10) }
    : { slug: identifier };

  const publication = await db.collection('publications').findOne(query);

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
