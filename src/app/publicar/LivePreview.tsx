'use client';

import React from 'react';
import Image from 'next/image'; // Importa el componente Image
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
                    {ad.media.map((mediaItem, index) => (
                        <div key={index} className="w-20 h-20 relative"> {/* Añadido div para el contenedor de la imagen */}
                            <Image
                                src={mediaItem}
                                alt={`Imagen ${index + 1}`}
                                layout="fill" // Asegura que la imagen se ajuste al contenedor
                                objectFit="cover"
                                className="rounded-md"
                            />
                        </div>
                    ))}
                </div>
            )}
            <p>WhatsApp: {ad.contact?.whatsapp}</p>
            <p>Ubicación: {ad.location?.city}, {ad.location?.region}</p> {/* Usando region en lugar de state */}
            {ad.price && <p>Precio: {ad.price.amount} {ad.price.currency}</p>}
        </div>
    );
};

export default LivePreview;