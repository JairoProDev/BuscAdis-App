// LivePreview.tsx
'use client';

import React from 'react';
import { QuickPublicationData } from '@/services/publications.service';

interface LivePreviewProps {
  ad: QuickPublicationData;
}

const LivePreview: React.FC<LivePreviewProps> = ({ ad }) => {
  return (
    <div className="border rounded-xl p-4">
      <h2 className="text-xl font-semibold mb-2">Vista Previa</h2>
      <h3 className="text-lg font-semibold">{ad.title}</h3>
      <p className="mb-2">{ad.description}</p>
      {ad.media && ad.media.length > 0 && (
        <div className="flex gap-2 mb-2">
          {ad.media.map((file, index) => (
            <img key={index} src={URL.createObjectURL(file)} alt={`Imagen ${index + 1}`} className="w-20 h-20 object-cover rounded-md" />
          ))}
        </div>
      )}
      <p>WhatsApp: {ad.contact?.whatsapp}</p>
      <p>Ubicación: {ad.location?.city}, {ad.location?.state}</p>
      {ad.price && <p>Precio: {ad.price.amount} {ad.price.currency}</p>}
    </div>
  );
};

export default LivePreview;