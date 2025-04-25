'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchPage from '@/components/search/SearchPage';

export default function Home() {
  return (
    <main>
      <SearchPage />
    </main>
  );
}