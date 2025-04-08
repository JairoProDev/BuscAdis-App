'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mongoFetch } from '@/lib/dbConnect';
import BuscadorPage from '@/app/buscar/page';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  
  // Validate the category
  useEffect(() => {
    const validateCategory = async () => {
      try {
        // Check if category is valid
        const response = await mongoFetch('/api/categories', {});
        const categories = response || [];
        
        const validCategory = categories.some(
          (cat: any) => cat.slug === category
        );
        
        if (!validCategory) {
          // Redirect to search page if category is invalid
          router.replace('/buscar');
        }
      } catch (error) {
        console.error('Error validating category:', error);
      }
    };
    
    validateCategory();
  }, [category, router]);
  
  // Re-use the search page component with the category pre-selected
  return <BuscadorPage initialCategory={category} />;
} 