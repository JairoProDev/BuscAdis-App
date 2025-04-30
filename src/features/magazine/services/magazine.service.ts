"use server";

import { Publication } from '@/types/publications';
import { format } from 'date-fns';
import { getServerMongoClient } from '@/lib/mongodb-server';
import { ObjectId } from 'mongodb';

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
    const { client, db } = await getServerMongoClient();
    
    // Find the latest magazine by creation date
    const magazinesCollection = db.collection('magazines');
    const latestMagazine = await magazinesCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    
    await client.close();
    
    if (latestMagazine.length === 0) {
      console.log('[Magazine Service] No magazines found');
      return null;
    }
    
    // Transform to the expected interface
    const magazine = latestMagazine[0];
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
 * Generate a new magazine and save it to storage
 */
export async function generateMagazine(): Promise<MagazineMetadata | null> {
  console.log('[Magazine Service] Generating new magazine');
  
  try {
    const response = await fetch('/api/magazine/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Magazine Service] Error generating magazine:', errorData);
      return null;
    }
    
    const data = await response.json();
    
    return {
      _id: data.magazineId,
      pdfUrl: data.pdfUrl,
      fileId: data.fileId,
      publicationCount: data.publicationCount,
      createdAt: new Date(data.createdAt)
    };
  } catch (error) {
    console.error('[Magazine Service] Error generating magazine:', error);
    return null;
  }
}

/**
 * Group publications by category for better organization in the magazine
 */
export async function groupPublicationsByCategory(publications: Publication[]): Promise<CategoryGroup[]> {
  const groupedByCategory: Record<string, Publication[]> = {};
  
  // Group publications by category
  publications.forEach(publication => {
    const category = publication.categorySlug || 'otros';
    
    if (!groupedByCategory[category]) {
      groupedByCategory[category] = [];
    }
    
    groupedByCategory[category].push(publication);
  });
  
  // Convert to array of category groups
  return Object.entries(groupedByCategory).map(([categoryName, publications]) => ({
    categoryName,
    publications
  }));
}

/**
 * Get magazine history (for admin purposes)
 */
export async function getMagazineHistory(): Promise<MagazineMetadata[]> {
  console.log('[Magazine Service] Getting magazine history');
  
  try {
    const { client, db } = await getServerMongoClient();
    
    const magazinesCollection = db.collection('magazines');
    const magazines = await magazinesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    await client.close();
    
    // Transform to the expected interface
    return magazines.map(magazine => ({
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