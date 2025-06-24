"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, Car, Briefcase, Wrench, ShoppingBag, 
  Calendar, TrendingUp, Users, Package, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MagazineCategoryCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  publicationCount?: number;
  lastUpdated?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'home': <Home size={24} />,
  'car': <Car size={24} />,
  'briefcase': <Briefcase size={24} />,
  'tool': <Wrench size={24} />,
  'shopping-bag': <ShoppingBag size={24} />,
  'calendar': <Calendar size={24} />,
  'trending-up': <TrendingUp size={24} />,
  'users': <Users size={24} />
};

export default function MagazineCategoryCard({
  id,
  name,
  description,
  icon,
  color,
  publicationCount,
  lastUpdated
}: MagazineCategoryCardProps) {
  const router = useRouter();
  
  const navigateToCategory = () => {
    router.push(`/revista/${id}`);
  };
  
  return (
    <div 
      className="rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: `${color}20` }}>
            <div style={{ color }}>
              {iconMap[icon] || <Package size={24} />}
            </div>
          </div>
          <h3 className="text-xl font-bold">{name}</h3>
        </div>
        
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        
        {publicationCount !== undefined && (
          <p className="text-sm text-gray-500 mb-1">
            {publicationCount} anuncios disponibles
          </p>
        )}
        
        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-4">
            Actualizada: {lastUpdated}
          </p>
        )}
        
        <Button
          onClick={navigateToCategory}
          className="w-full flex items-center justify-center mt-auto"
          style={{ backgroundColor: color }}
        >
          Ver Revista <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 