'use client'

import Hero from '@/components/home/Hero';
import CategorySlider from '@/components/home/CategorySlider';
import Features from '@/components/home/Features';
import Benefits from '@/components/home/Benefits';
import Tools from '@/components/home/Tools';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import Stats from '@/components/home/Stats';
import Comparison from '@/components/home/Comparison';
import CallToAction from '@/components/home/CallToAction';

export default function Home() {
  return (
    <main>
      <Hero />
      <CategorySlider />
      {/* <Features /> */}
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
