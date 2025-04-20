'use client';

import { useEffect } from 'react';

/**
 * Componente que inyecta los estilos específicos para solucionar los problemas
 * de interacción con el modal de publicación
 */
export default function PublicationModalStyles() {
  useEffect(() => {
    // Crear elemento de estilo
    const style = document.createElement('style');
    style.id = 'publication-modal-fixes';
    
    // Definir los estilos críticos para el modal
    style.textContent = `
      /* Fix para el problema de interacción con el modal */
      .publication-modal {
        pointer-events: auto !important;
        cursor: default !important;
        z-index: 1000 !important;
        overflow: auto !important;
      }
      
      /* Asegurar que todos los elementos dentro del modal sean interactivos */
      .publication-modal * {
        pointer-events: auto !important;
      }
      
      /* Los botones y enlaces deben ser clickeables */
      .publication-modal button,
      .publication-modal a,
      .publication-modal [role="button"] {
        cursor: pointer !important;
        pointer-events: auto !important;
        z-index: 10 !important;
      }
      
      /* El fondo oscuro no debe interceptar clics destinados al modal */
      .fixed.inset-0.bg-black\\/70 {
        pointer-events: none !important;
      }
      
      /* Estructura básica del modal */
      .publication-modal.bg-white {
        max-height: 90vh;
        overflow: auto;
      }
      
      /* Asegurar que los botones del modal funcionen */
      .publication-modal motion\\.button,
      .publication-modal .motion-button,
      .publication-modal motion\\.a,
      .publication-modal .motion-a {
        pointer-events: auto !important;
        cursor: pointer !important;
        z-index: 20 !important;
      }

      /* Framer Motion buttons */
      .publication-modal .motion-div,
      .publication-modal div[style*="transform"] {
        pointer-events: auto !important;
        cursor: pointer !important;
        z-index: 10 !important;
      }

      /* Estilos para mostrar durante la exportación */
      .exporting-only {
        display: none;
      }
      
      .exporting .exporting-only {
        display: block;
      }
      
      /* Asegurar que no se muestre el scrollbar durante la exportación */
      .exporting {
        overflow: hidden !important;
        max-height: none !important;
      }
    
      /* Prevenir scroll cuando el modal está abierto */
      body.modal-open {
        overflow: hidden;
        position: fixed;
        width: 100%;
      }
    
      /* Mejorar la apariencia de las imágenes en el modal */
      .publication-modal img {
        transition: transform 0.3s ease;
      }
    
      /* Añadir efecto de iluminación al hacer hover en las imágenes */
      .publication-modal .group:hover::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
        pointer-events: none;
        z-index: 5;
      }
    
      /* Mejorar la sombra del modal */
      .publication-modal {
        filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
        overflow: auto;
        pointer-events: auto !important;
      }
    
      /* Grid layout for desktop and mobile */
      @media (min-width: 768px) {
        .publication-modal .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-height: 85vh;
        }
        
        .publication-modal .overflow-y-auto {
          max-height: 85vh;
        }
      }
      
      @media (max-width: 767px) {
        .publication-modal .grid {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr;
        }
      }
    `;
    
    // Agregar el estilo al head del documento
    document.head.appendChild(style);
    
    // Limpieza al desmontar
    return () => {
      const styleElement = document.getElementById('publication-modal-fixes');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);
  
  // Este componente no renderiza nada visualmente
  return null;
} 