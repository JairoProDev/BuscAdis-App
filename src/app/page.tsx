'use client'

import { useEffect, useState } from 'react';
import { CategoriesService } from '@/services/categories.service';
import CategorySlider from '@/components/home/CategorySlider';
import FeaturedAds from '@/components/home/FeaturedAds';
import AdisoSection from '@/components/home/AdisoSection';
import Hero from '@/components/home/Hero';
import CategoryRow from '@/components/home/CategoryRow';
import Benefits from '@/components/home/Benefits';
import Tools from '@/components/home/Tools';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import Stats from '@/components/home/Stats';
import Comparison from '@/components/home/Comparison';
import CallToAction from '@/components/home/CallToAction';
import LoadingState from '@/components/ui/LoadingState';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesObj = await CategoriesService.getCategories();
        // Convertir el objeto de categorías a un array
        const categoriesArray = Object.keys(categoriesObj).map(key => ({
          id: key.toLowerCase(),
          name: key
        }));
        setCategories(categoriesArray);
      } catch (err) {
        console.error('Error fetching categories:', err);
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
      <CategorySlider />
      <CategoryRow />
      <Benefits />
      <Tools />
      <HowItWorks />
      <Testimonials />
      <Stats />
      <Comparison />
      <CallToAction />
      {!loading && categories.map((category) => (
        <AdisoSection 
          key={category.id}
          type={category.id}
          title={category.name}
        />
      ))}
    </main>
  );
}
