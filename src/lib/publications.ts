
import { Publication } from "@/services/publications.service";
import { notFound } from "next/navigation";

async function fetchPublication(url: string): Promise<Publication | null> {
  try {
    const response = await fetch(url, {
      cache: 'no-store'
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.publication || data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    return null;
  }
}

export async function getPublicationBySlugOrId(idOrSlug: string): Promise<Publication | null> {
  const isNumeric = /^\d+$/.test(idOrSlug);
  let publication: Publication | null = null;

  if (isNumeric) {
    publication = await fetchPublication(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/publications/by-sequential/${idOrSlug}`);
  }

  if (!publication) {
    publication = await fetchPublication(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/publications/by-slug/${idOrSlug}`);
  }

  if (!publication) {
     publication = await fetchPublication(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/publications/${idOrSlug}`);
  }

  return publication;
}
