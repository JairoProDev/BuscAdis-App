import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ImportarRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/importar');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirigiendo...</p>
    </div>
  );
} 