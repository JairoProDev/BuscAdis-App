import { NextResponse } from 'next/server';
import { getCategoriesWithIcons } from '@/lib/categories';

export const dynamic = 'force-dynamic'; // Disable caching to ensure data is always fresh

export async function GET() {
  try {
    // Usar el sistema unificado de categorías
    const categories = getCategoriesWithIcons();
    
    // Formatear para la respuesta de la API
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      iconName: category.icon, // Para mantener compatibilidad
      slug: category.id, // Usar id como slug
      imageUrl: category.imageUrl,
      gradient: category.gradient,
      count: 0 // Se podría implementar conteo real en el futuro
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