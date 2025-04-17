import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { categories as staticCategories } from '@/lib/constants';

export const dynamic = 'force-dynamic'; // Disable caching to ensure data is always fresh

// Define Category Schema
const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  iconName: { type: String },
  slug: { type: String, required: true },
  imageUrl: { type: String },
  count: { type: Number, default: 0 }
});

// Get Category model (or create if it doesn't exist)
const getCategoryModel = () => {
  try {
    return mongoose.models.categories || 
      mongoose.model('categories', CategorySchema, 'categories');
  } catch (error) {
    console.error('Error creating Category model:', error);
    // Return existing model if creation fails
    return mongoose.models.categories;
  }
};

export async function GET() {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Get model
    const CategoryModel = getCategoryModel();
    
    // Get categories from MongoDB
    const categories = await CategoryModel.find({}).lean();
    
    // If no categories in DB, use static ones
    if (!categories || categories.length === 0) {
      // Convert static categories object to array
      const categoriesArray = Object.entries(staticCategories).map(([id, category]) => ({
        id,
        name: category.name,
        description: category.description,
        icon: category.iconName || (typeof category.icon === 'string' ? category.icon : undefined),
        iconName: category.iconName,
        slug: category.slug,
        imageUrl: category.imageUrl,
        count: category.count || 0
      }));
      
      // Try to seed the database with static categories
      try {
        // Ensure the model is available before inserting
        const CategoryModelForSeed = getCategoryModel(); 
        if (CategoryModelForSeed) {
           await CategoryModelForSeed.insertMany(categoriesArray);
           console.log('Successfully seeded categories into the database.');
        } else {
            console.error('Category model not available for seeding.');
        }
      } catch (error) {
        console.error('Error seeding categories:', error);
        // Continue with the static categories even if seeding fails
      }
      
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
      icon: category.iconName || (typeof category.icon === 'string' ? category.icon : undefined),
      iconName: category.iconName,
      slug: category.slug,
      imageUrl: category.imageUrl,
      count: category.count || 0
    }));
    
    return NextResponse.json(categoriesArray);
  }
} 