'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RedirectToGuardados = () => {
  const router = useRouter();
  useEffect(() => {
    // This page IS guardados; avoid redirect loops.
  }, [router]);
  return (
    <div className="p-8 text-center text-gray-500 dark:text-gray-300">
      Aún no tienes guardados.
    </div>
  );
};

export default RedirectToGuardados;
