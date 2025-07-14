import type { NextRouter } from 'next/router';

export const handlePostAuthRedirect = (router: NextRouter, searchParams: URLSearchParams) => {
  const redirect = searchParams.get('redirect');
  const data = searchParams.get('data');
  
  if (redirect) {
    if (data) {
      // Restaurar datos del formulario en sessionStorage
      sessionStorage.setItem('formData', data);
    }
    router.push(redirect);
  } else {
    router.push('/');
  }
};
