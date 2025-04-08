'use client'

import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import Benefits from '@/components/home/Functionalitys';
import Tools from '@/components/home/Tools';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import Stats from '@/components/home/Stats';
import Comparison from '@/components/home/Comparison';
import CallToAction from '@/components/home/CallToAction';
import LoadingState from '@/components/ui/LoadingState';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedListingsSection from '@/components/home/FeaturedListingsSection';
import BenefitsSection from '@/components/home/BenefitsSection';

export default function InicioPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Simulated API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <LoadingState text="Cargando..." />;
  }

  return (
    <main>
      <Hero />
      <CategoriesSection />
      <FeaturedListingsSection />
      <BenefitsSection />
      <Benefits />
      <Tools />
      <HowItWorks />
      <Testimonials />
      <Stats />
      <Comparison />
      <CallToAction />
    </main>
  );
} 