'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { mongoFetch } from '@/lib/dbConnect';
import BuscadorPage from '@/app/buscar/page';

export default function SubSubcategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const subcategory = params.subcategory as string;
  const subsubcategory = params.subsubcategory as string;
  
  // Validate the category path
  useEffect(() => {
    const validateCategoryPath = async () => {
      try {
        // Check if category is valid
        const categoriesResponse = await mongoFetch('/api/categories', {});
        const categories = categoriesResponse || [];
        
        const validCategory = categories.some(
          (cat: any) => cat.slug === category
        );
        
        if (!validCategory) {
          router.replace('/buscar');
          return;
        }
        
        // Check if subcategory is valid
        const subcategoriesResponse = await mongoFetch(`/api/categories/${category}/subcategories`, {});
        const subcategories = subcategoriesResponse || [];
        
        const validSubcategory = subcategories.some(
          (subcat: any) => subcat.slug === subcategory
        );
        
        if (!validSubcategory) {
          router.replace(`/${category}`);
          return;
        }
        
        // Check if sub-subcategory is valid
        const subsubcategoriesResponse = await mongoFetch(
          `/api/categories/${category}/subcategories/${subcategory}/options`, 
          {}
        );
        const subsubcategories = subsubcategoriesResponse || [];
        
        const validSubSubcategory = subsubcategories.some(
          (subsubcat: any) => subsubcat.slug === subsubcategory
        );
        
        if (!validSubSubcategory) {
          router.replace(`/${category}/${subcategory}`);
        }
      } catch (error) {
        console.error('Error validating category path:', error);
      }
    };
    
    validateCategoryPath();
  }, [category, subcategory, subsubcategory, router]);
  
  // Re-use the search page component with all category levels pre-selected
  return (
    <BuscadorPage 
      initialCategory={category} 
      initialSubcategory={subcategory}
      initialSubSubcategory={subsubcategory}
    />
  );
} 