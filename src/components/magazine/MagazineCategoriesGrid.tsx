"use client";

import React, { useState, useEffect } from 'react';
import MagazineCategoryCard from './MagazineCategoryCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  collectionName: string;
}

export default function MagazineCategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/magazine/list-categories');
        const data = await response.json();
        
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error loading magazine categories:', err);
        setError('No se pudieron cargar las categorías de revistas');
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map(() => (
          <div key={`skeleton-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="h-64">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <MagazineCategoryCard
          key={category.id}
          id={category.id}
          name={category.name}
          description={category.description}
          icon={category.icon}
          color={category.color}
        />
      ))}
    </div>
  );
} 