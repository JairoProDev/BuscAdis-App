import { Publication } from '@/types/publications';
import { mongoDbQuery } from '@/lib/mongodb-server';
import { MagazineError, MagazineMetadata, CategoryGroup } from './types';

/**
 * Fetch the latest magazine from MongoDB
 * @throws {MagazineError} If there is an error fetching the magazine
 */
export async function fetchLatestMagazine(): Promise<MagazineMetadata> {
  console.log('[Magazine Service] Fetching latest magazine');
  
  try {
    // Find the latest magazine by creation date
    const latestMagazines = await mongoDbQuery(
      'magazines', 
      {}, 
      { sort: { createdAt: -1 }, limit: 1 }
    );
    
    if (latestMagazines.length === 0) {
      throw MagazineError.NotFound('No magazines found');
    }
    
    // Transform to the expected interface
    const magazine = latestMagazines[0];
    if (!magazine.pdfUrl || !magazine.fileId) {
      throw MagazineError.StorageError('Invalid magazine data in database');
    }
    
    return {
      _id: magazine._id?.toString() || '',
      pdfUrl: magazine.pdfUrl,
      fileId: magazine.fileId?.toString() || '',
      publicationCount: magazine.publicationCount || 0,
      createdAt: new Date(magazine.createdAt || Date.now()),
      filename: magazine.filename,
      categoryId: magazine.categoryId
    };
  } catch (error) {
    if (error instanceof MagazineError) {
      throw error;
    }
    console.error('[Magazine Service] Error fetching latest magazine:', error);
    throw MagazineError.GenerationFailed('Failed to fetch latest magazine');
  }
}

/**
 * Get magazine history (for admin purposes)
 * @throws {MagazineError} If there is an error fetching the magazine history
 */
export async function getMagazineHistory(): Promise<MagazineMetadata[]> {
  console.log('[Magazine Service] Getting magazine history');
  
  try {
    const magazines = await mongoDbQuery(
      'magazines', 
      {}, 
      { sort: { createdAt: -1 } }
    );
    
    // Transform to the expected interface
    return magazines.map((magazine: Record<string, unknown>) => ({
      _id: magazine._id?.toString() || '',
      pdfUrl: magazine.pdfUrl as string || '',
      fileId: magazine.fileId?.toString() || '',
      publicationCount: (magazine.publicationCount as number) || 0,
      createdAt: new Date(magazine.createdAt ? magazine.createdAt as string : Date.now()),
      filename: magazine.filename as string,
      categoryId: magazine.categoryId as string
    }));
  } catch (error) {
    console.error('[Magazine Service] Error getting magazine history:', error);
    throw MagazineError.GenerationFailed('Failed to fetch magazine history');
  }
}

/**
 * Deletes a magazine by its ID
 */
export async function deleteMagazine(magazineId: string, fileId: string): Promise<boolean> {
  console.log(`[Magazine Service] Deleting magazine with ID: ${magazineId}`);
  
  try {
    const response = await fetch('/api/magazine/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ magazineId, fileId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Magazine Service] Error deleting magazine:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Magazine Service] Error deleting magazine:', error);
    return false;
  }
} 