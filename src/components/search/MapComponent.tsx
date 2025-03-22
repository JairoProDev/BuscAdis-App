// src/components/search/MapComponent.tsx
import React from 'react';

interface MapComponentProps {
    publications: any[];
}

const MapComponent: React.FC<MapComponentProps> = ({ publications }) => {
    // Implementa aquí la lógica del mapa interactivo
    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Mapa de Anuncios</h2>
            <div className="h-96 bg-gray-200 rounded-lg">
                {/* Mapa interactivo */}
            </div>
        </div>
    );
};

export default MapComponent;