'use client';

import React from 'react';
import { PublicationProvider } from '../../contexts/PublicationContext';

export default function PublishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicationProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Publicar Anuncio
            </h1>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </PublicationProvider>
  );
} 