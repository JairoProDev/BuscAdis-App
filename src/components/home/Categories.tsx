'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const defaultCategories = [
    { id: 'empleos', name: 'Empleo', icon: '', color: 'bg-purple-500' },
    { id: 'inmuebles', name: 'Inmuebles', icon: '', color: 'bg-green-500' },
    { id: 'vehiculos', name: 'Vehículos', icon: '', color: 'bg-blue-500' },
    { id: 'servicios', name: 'Servicios', icon: '', color: 'bg-red-500' },
    { id: 'productos', name: 'Productos', icon: '️', color: 'bg-yellow-500' },
    { id: 'mascotas', name: 'Mascotas', icon: '', color: 'bg-pink-500' },
    { id: 'turismo', name: 'Turismo', icon: '✈️', color: 'bg-orange-500' },
    { id: 'negocios', name: 'Negocios', icon: '', color: 'bg-teal-500' },
    { id: 'educacion', name: 'Educación', icon: '', color: 'bg-indigo-500' },
    { id: 'otros', name: 'Otros', icon: '', color: 'bg-gray-500' }
];

export default function Categories() {
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Si se implementa el backend para categorías, descomentar este código
        /*
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const data = await response.json();
        if (data && data.length > 0) {
          setCategories(data);
        }
        */
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  console.log('Categories:', categories); // Verificar datos

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {categories.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link href={`/buscar?category=${category.id}`}>
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 text-center cursor-pointer">
              <div className={`w-12 h-12 rounded-full ${category.color} mx-auto mb-3 flex items-center justify-center text-2xl`}>
                {category.icon}
              </div>
              <h3 className="font-medium text-gray-800">{category.name}</h3>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
