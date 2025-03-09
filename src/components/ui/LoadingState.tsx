import React from 'react';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

export default function LoadingState({ 
  size = 'md', 
  text = 'Cargando...', 
  fullscreen = false
}: LoadingStateProps) {
  // Determinar el tamaño del spinner
  const spinnerSize = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size];

  // Contenido del componente
  const content = (
    <div className="flex flex-col items-center justify-center p-6">
      <div className={`${spinnerSize} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}></div>
      {text && <p className="mt-4 text-primary-600 font-medium">{text}</p>}
    </div>
  );

  // Si es fullscreen, mostrar el loading en toda la pantalla
  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        {content}
      </div>
    );
  }

  // Si no, mostrar en el contenedor actual
  return content;
}
