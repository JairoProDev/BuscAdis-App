'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RedirectToGuardados = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/guardados');
  }, [router]);
  return <div className="p-8 text-center text-gray-500">Redirigiendo a Guardados...</div>;
};

export default RedirectToGuardados;
