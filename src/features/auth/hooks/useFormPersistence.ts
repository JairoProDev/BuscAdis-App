import { useState, useEffect } from 'react';

export function useFormPersistence(key: string, initialData = null) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      try {
        setData(JSON.parse(stored));
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error('Error parsing stored form data:', error);
      }
    }
  }, [key]);

  return data;
}
