'use client';

import React from 'react';
import { CheckCircleIcon, ShareIcon, EyeIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface SuccessMessageProps {
  title: string;
  message: string;
  publishedId?: string | null;
  onNewPublication?: () => void;
  onViewPublication?: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  message,
  publishedId,
  onNewPublication,
  onViewPublication
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6"
    >
      {/* Icono de éxito animado */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="relative">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
          {/* Efecto de ondas */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 w-20 h-20 bg-green-200 rounded-full"
          />
        </div>
      </motion.div>

      {/* Mensaje principal */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{message}</p>
        {publishedId && (
          <p className="text-sm text-gray-500">
            ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{publishedId}</span>
          </p>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">✨</div>
            <div className="text-sm text-gray-600">Publicado</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">🚀</div>
            <div className="text-sm text-gray-600">En línea</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">👀</div>
            <div className="text-sm text-gray-600">Visible</div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onViewPublication && (
          <button
            onClick={onViewPublication}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <EyeIcon className="w-5 h-5 mr-2" />
            Ver Publicación
          </button>
        )}
        
        <button
          onClick={() => {
            if (navigator.share && publishedId) {
              navigator.share({
                title: 'Mi anuncio en BuscAdis',
                text: 'Mira mi nuevo anuncio',
                url: `${window.location.origin}/anuncios/${publishedId}`
              });
            }
          }}
          className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ShareIcon className="w-5 h-5 mr-2" />
          Compartir
        </button>

        {onNewPublication && (
          <button
            onClick={onNewPublication}
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Publicar Otro
          </button>
        )}
      </div>

      {/* Consejos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <h3 className="font-semibold text-blue-900 mb-2">💡 ¿Qué sigue?</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Tu anuncio ya está visible para miles de usuarios</li>
          <li>• Responde rápido a los mensajes para mejores resultados</li>
          <li>• Puedes editar o renovar tu anuncio en cualquier momento</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default SuccessMessage; 