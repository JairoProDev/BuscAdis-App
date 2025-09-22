import React from 'react';
import AdisoCard from './AdisoCard';

interface AdisoLocation {
  city?: string;
  country?: string;
}

interface AdisoPrice {
  amount?: number;
}

interface AdisoData {
  id: string;
  title: string;
  price: number | AdisoPrice;
  location: string | AdisoLocation;
  image?: string;
  is_premium?: boolean;
  is_verified?: boolean;
  rating?: number;
  category?: string;
  categorySlug?: string;
}

interface AdisosGridProps {
  adisos: AdisoData[];
}

const AdisosGrid = ({ adisos }: AdisosGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adisos.map((adiso) => (
                <AdisoCard key={adiso.id} adiso={adiso} />
            ))}
        </div>
    );
};

export default AdisosGrid;
