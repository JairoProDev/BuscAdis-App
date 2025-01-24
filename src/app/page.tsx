'use client'

import Hero from '@/components/home/Hero';
import CategorySlider from '@/components/home/CategorySlider';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import Stats from '@/components/home/Stats';
import CallToAction from '@/components/home/CallToAction';

export default function Home() {
  return (
    <main>
      <Hero />
      <CategorySlider />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Stats />
      <CallToAction />
    </main>
  );
}
