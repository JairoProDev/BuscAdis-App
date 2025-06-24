'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mongoFetch } from '@/lib/dbConnect';
import BuscadorPage from '@/app/buscar/page';

interface Category {
  slug: string;
  name: string;
}

interface Subcategory {
  slug: string;
  name: string;
}

export default function SubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = params?.category as string;
  const subcategory = params?.subcategory as string;
  
  // Validate the category path
  useEffect(() => {
    const validateCategoryPath = async () => {
      try {
        // Check if category is valid
        const categoriesResponse = await mongoFetch('/api/categories', {});
        const categories = categoriesResponse || [];
        
        const validCategory = categories.some(
          (cat: Category) => cat.slug === category
        );
        
        if (!validCategory) {
          // Redirect to search page if category is invalid
          router.replace('/buscar');
          return;
        }
        
        // Check if subcategory is valid for this category
        const subcategoriesResponse = await mongoFetch(`/api/categories/${category}/subcategories`, {});
        const subcategories = subcategoriesResponse || [];
        
        const validSubcategory = subcategories.some(
          (subcat: Subcategory) => subcat.slug === subcategory
        );
        
        if (!validSubcategory) {
          // Redirect to category page if subcategory is invalid
          router.replace(`/${category}`);
        }
      } catch (error) {
        console.error('Error validating category path:', error);
      }
    };
    
    validateCategoryPath();
  }, [category, subcategory, router]);
  
  // Re-use the search page component 
  return (
    <div className="container py-16">
      <h1>Subcategoría: {subcategory}</h1>
      <p>Categoría: {category}</p>
      <BuscadorPage />
    </div>
  );
} 