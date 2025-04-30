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

        <main>{children}</main>
      </div>
    </PublicationProvider>
  );
} 