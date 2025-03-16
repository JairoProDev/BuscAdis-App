'use client'

import { useEffect, useState } from 'react';
import { CategoriesService, Categories } from '@/services/categories.service';
import Hero from '@/components/home/Hero';
import Benefits from '@/components/home/Benefits';
import Tools from '@/components/home/Tools';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import Stats from '@/components/home/Stats';
import Comparison from '@/components/home/Comparison';
import CallToAction from '@/components/home/CallToAction';
import LoadingState from '@/components/ui/LoadingState';
import { Suspense } from 'react';
import FeaturedClassifiedads from '@/components/home/FeaturedClassifiedads';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function Home() {
  const [categories, setCategories] = useState(Categories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await CategoriesService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Mantén las categorías estáticas en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <LoadingState text="Cargando categorías..." />;
  }

  return (
    <main>
      <Hero />
      {/* Comentar los componentes que no se están utilizando */}
      {/* <CategorySlider /> */}
      {/* <CategoryRow /> */}
      <Benefits />
      <Tools />
      <HowItWorks />
      <Testimonials />
      <Stats />
      <Comparison />
      <CallToAction />
      
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explora por categorías
          </h2>
          {/* <Categories /> */}
        </div>
      </section>
      
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Anuncios destacados
          </h2>
          <Suspense fallback={<FeaturedClassifiedadsSkeleton />}>
            <FeaturedClassifiedads />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

function FeaturedClassifiedadsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array(8).fill(0).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
