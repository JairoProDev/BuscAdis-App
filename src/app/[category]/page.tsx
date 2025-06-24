'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mongoFetch } from '@/lib/dbConnect';
import BuscadorPage from '@/app/buscar/page';

interface Category {
  slug: string;
  name: string;
}

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = params?.category as string;
  
  // Validate the category
  useEffect(() => {
    const validateCategory = async () => {
      try {
        const response = await mongoFetch('/api/categories', {});
        const categories = response || [];
        
        const isValidCategory = categories.some(
          (cat: Category) => cat.slug === category
        );
        
        if (!isValidCategory) {
          router.replace('/buscar');
        }
      } catch (error) {
        console.error('Error validating category:', error);
      }
    };
    
    validateCategory();
  }, [category, router]);
  
  // Re-use the search page component 
  return (
    <div className="container py-16">
      <h1>Categoría: {category}</h1>
      <BuscadorPage />
    </div>
  );
} 