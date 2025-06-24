import { Publication } from '@/types/publications';
import { mongoDbQuery, mongoDbInsert } from '@/lib/mongodb-server';

// Type for the Magazine metadata
export interface MagazineMetadata {
  _id: string;
  pdfUrl: string;
  fileId: string;
  publicationCount: number;
  createdAt: Date;
  filename?: string;
}

export interface CategoryGroup {
  categoryName: string;
  publications: Publication[];
}

/**
 * Fetch the latest magazine from MongoDB
 */
export async function fetchLatestMagazine(): Promise<MagazineMetadata | null> {
  console.log('[Magazine Service] Fetching latest magazine');
  
  try {
    // Find the latest magazine by creation date
    const latestMagazines = await mongoDbQuery(
      'magazines', 
      {}, 
      { sort: { createdAt: -1 }, limit: 1 }
    );
    
    if (latestMagazines.length === 0) {
      console.log('[Magazine Service] No magazines found');
      return null;
    }
    
    // Transform to the expected interface
    const magazine = latestMagazines[0];
    return {
      _id: magazine._id.toString(),
      pdfUrl: magazine.pdfUrl,
      fileId: magazine.fileId.toString(),
      publicationCount: magazine.publicationCount,
      createdAt: magazine.createdAt,
      filename: magazine.filename
    };
  } catch (error) {
    console.error('[Magazine Service] Error fetching latest magazine:', error);
    return null;
  }
}

/**
 * Get magazine history (for admin purposes)
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
    return magazines.map((magazine: any) => ({
      _id: magazine._id.toString(),
      pdfUrl: magazine.pdfUrl,
      fileId: magazine.fileId.toString(),
      publicationCount: magazine.publicationCount,
      createdAt: magazine.createdAt,
      filename: magazine.filename
    }));
  } catch (error) {
    console.error('[Magazine Service] Error getting magazine history:', error);
    return [];
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