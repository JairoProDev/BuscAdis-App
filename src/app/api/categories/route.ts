import { NextResponse } from 'next/server';
import { categories as staticCategories } from '@/lib/constants';

export const dynamic = 'force-dynamic'; // Disable caching to ensure data is always fresh

export async function GET() {
  try {
    // Simplemente usar las categorías estáticas, sin MongoDB
    const categoriesArray = Object.values(staticCategories).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.iconName || (typeof category.icon === 'string' ? category.icon : undefined),
      iconName: category.iconName,
      slug: category.slug,
      imageUrl: category.imageUrl,
      count: category.count || 0
    }));
    
    return NextResponse.json(categoriesArray);
  } catch (error) {
    console.error('Error processing categories:', error);
    return NextResponse.json([]);
  }
} 