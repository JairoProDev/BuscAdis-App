import { NextResponse } from 'next/server';
import { getCategoriesWithIcons } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use unified categories configuration (not tied to DB collections)
    const categories = getCategoriesWithIcons();

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      iconName: category.icon,
      slug: category.id,
      imageUrl: category.imageUrl,
      gradient: category.gradient,
      count: 0,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}


