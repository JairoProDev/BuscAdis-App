import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return null;
  }

  // Determinar qué páginas mostrar
  const renderPageButtons = () => {
    const pages = [];
    
    // Siempre mostrar la primera página
    pages.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? 'bg-primary-600 text-white'
            : 'bg-white text-primary-600 hover:bg-gray-100'
        }`}
      >
        1
      </button>
    );
    
    // Agregar puntos suspensivos después de la página 1 si es necesario
    if (currentPage > 3) {
      pages.push(
        <span key="dots1" className="px-2 py-1">
          ...
        </span>
      );
    }
    
    // Agregar la página anterior si no es la primera
    if (currentPage > 2) {
      pages.push(
        <button
          key={currentPage - 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 rounded bg-white text-primary-600 hover:bg-gray-100"
        >
          {currentPage - 1}
        </button>
      );
    }
    
    // Agregar la página actual si no es la primera ni la última
    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push(
        <button
          key={currentPage}
          onClick={() => onPageChange(currentPage)}
          className="px-3 py-1 rounded bg-primary-600 text-white"
        >
          {currentPage}
        </button>
      );
    }
    
    // Agregar la página siguiente si no es la última
    if (currentPage < totalPages - 1) {
      pages.push(
        <button
          key={currentPage + 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 rounded bg-white text-primary-600 hover:bg-gray-100"
        >
          {currentPage + 1}
        </button>
      );
    }
    
    // Agregar puntos suspensivos antes de la última página si es necesario
    if (currentPage < totalPages - 2) {
      pages.push(
        <span key="dots2" className="px-2 py-1">
          ...
        </span>
      );
    }
    
    // Siempre mostrar la última página si no es la misma que la primera
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? 'bg-primary-600 text-white'
              : 'bg-white text-primary-600 hover:bg-gray-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-white text-primary-600 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
      >
        Anterior
      </button>
      
      {/* Botones de Página */}
      {renderPageButtons()}
      
      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-white text-primary-600 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
      >
        Siguiente
      </button>
    </div>
  );
}
