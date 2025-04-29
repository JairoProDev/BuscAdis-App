import { Publication } from '@/types/publications';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

// Type for the Magazine metadata
interface MagazineMetadata {
  url: string;
  lastUpdated: string;
  totalPublications: number;
  createdAt: Date;
}

/**
 * Fetch the latest magazine from storage
 */
export async function fetchLatestMagazine(): Promise<MagazineMetadata | null> {
  try {
    // Get the most recent magazine
    const { data: magazines, error } = await supabase
      .from('magazines')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!magazines || magazines.length === 0) {
      return null;
    }

    const latestMagazine = magazines[0];
    return {
      url: latestMagazine.pdf_url,
      lastUpdated: format(new Date(latestMagazine.created_at), 'dd/MM/yyyy HH:mm'),
      totalPublications: latestMagazine.publication_count,
      createdAt: new Date(latestMagazine.created_at)
    };
  } catch (error) {
    console.error('Error fetching latest magazine:', error);
    throw error;
  }
}

/**
 * Generate a new magazine and save it to storage
 */
export async function generateMagazine(): Promise<MagazineMetadata> {
  try {
    // 1. Fetch all active publications
    const { data: publications, error: publicationsError } = await supabase
      .from('publications')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (publicationsError) throw publicationsError;

    if (!publications || publications.length === 0) {
      throw new Error('No hay publicaciones activas para generar la revista');
    }

    // 2. Request magazine generation from the API endpoint
    const response = await fetch('/api/magazine/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publications }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al generar la revista');
    }

    const magazineData = await response.json();

    // 3. Return the metadata
    return {
      url: magazineData.pdfUrl,
      lastUpdated: format(new Date(), 'dd/MM/yyyy HH:mm'),
      totalPublications: publications.length,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error generating magazine:', error);
    throw error;
  }
}

/**
 * Group publications by category for better organization in the magazine
 */
export function groupPublicationsByCategory(publications: Publication[]): Record<string, Publication[]> {
  return publications.reduce((grouped, publication) => {
    const category = publication.categorySlug || 'otros';
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(publication);
    return grouped;
  }, {} as Record<string, Publication[]>);
}

/**
 * Get magazine history (for admin purposes)
 */
export async function getMagazineHistory(limit = 10): Promise<MagazineMetadata[]> {
  try {
    const { data: magazines, error } = await supabase
      .from('magazines')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    if (!magazines) {
      return [];
    }

    return magazines.map(magazine => ({
      url: magazine.pdf_url,
      lastUpdated: format(new Date(magazine.created_at), 'dd/MM/yyyy HH:mm'),
      totalPublications: magazine.publication_count,
      createdAt: new Date(magazine.created_at)
    }));
  } catch (error) {
    console.error('Error fetching magazine history:', error);
    throw error;
  }
} 