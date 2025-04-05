import { NextResponse } from 'next/server';
import getMongoClient from '@/lib/mongodb';
import { categories as staticCategories } from '@/lib/constants';

export const dynamic = 'force-dynamic'; // Disable caching to ensure data is always fresh

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db('test');
    const collection = db.collection('categories');
    
    // Get categories from MongoDB
    const categories = await collection.find({}).toArray();
    
    // If no categories in DB, use static ones
    if (!categories || categories.length === 0) {
      // Convert static categories object to array
      const categoriesArray = Object.entries(staticCategories).map(([id, category]) => ({
        id,
        name: category.name,
        description: category.description,
        icon: typeof category.icon === 'function' ? category.iconName : category.icon,
        slug: category.slug,
        imageUrl: category.imageUrl,
        count: category.count || 0
      }));
      
      return NextResponse.json(categoriesArray);
    }
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Fallback to static categories in case of error
    const categoriesArray = Object.entries(staticCategories).map(([id, category]) => ({
      id,
      name: category.name,
      description: category.description,
      icon: typeof category.icon === 'function' ? category.iconName : category.icon,
      slug: category.slug,
      imageUrl: category.imageUrl,
      count: category.count || 0
    }));
    
    return NextResponse.json(categoriesArray);
  }
} 