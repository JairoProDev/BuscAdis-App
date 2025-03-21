import React from 'react';
import AdisoCard from './AdisoCard';

const AnunciosGrid = ({ anuncios }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anuncios.map((adiso) => (
                <AdisoCard key={adiso.id} adiso={adiso} />
            ))}
        </div>
    );
};

export default AnunciosGrid;
