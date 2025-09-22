import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InformationCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service';

interface Tip {
  id: string;
  text: string;
  type: 'info' | 'suggestion' | 'warning';
}

interface UserGuidanceProps {
  step: number;
  field?: string;
  value?: string;
}

export default function UserGuidance({ step, field, value }: UserGuidanceProps) {
  const getTips = (): Tip[] => {
    const tips: Tip[] = [];

    // Tips generales por paso
    switch (step) {
      case 1: // Categoría
        tips.push({
          id: 'category_tip_1',
          text: 'Selecciona la categoría que mejor describa tu producto o servicio',
          type: 'info'
        });
        tips.push({
          id: 'category_tip_2',
          text: 'Una categoría correcta ayuda a que más personas encuentren tu adiso',
          type: 'suggestion'
        });
        break;

      case 2: // Detalles
        if (field === 'title') {
          if (!value) {
            tips.push({
              id: 'title_empty',
              text: 'Un buen título es clave para atraer compradores',
              type: 'info'
            });
          } else if (value.length < 20) {
            tips.push({
              id: 'title_short',
              text: 'Intenta hacer el título más descriptivo',
              type: 'suggestion'
            });
          }
        }
        
        if (field === 'description') {
          if (!value) {
            tips.push({
              id: 'description_empty',
              text: 'Describe tu producto o servicio en detalle',
              type: 'info'
            });
          } else if (value.length < 100) {
            tips.push({
              id: 'description_short',
              text: 'Una descripción detallada aumenta la confianza del comprador',
              type: 'suggestion'
            });
          }
        }
        break;

      case 3: // Media
        tips.push({
          id: 'media_tip_1',
          text: 'Las imágenes de buena calidad aumentan las posibilidades de venta',
          type: 'info'
        });
        tips.push({
          id: 'media_tip_2',
          text: 'Muestra tu producto desde diferentes ángulos',
          type: 'suggestion'
        });
        break;

      case 4: // Contacto
        tips.push({
          id: 'contact_tip_1',
          text: 'Asegúrate de que tu número de WhatsApp sea correcto',
          type: 'warning'
        });
        break;

      case 5: // Preview
        tips.push({
          id: 'preview_tip_1',
          text: 'Revisa todos los detalles antes de publicar',
          type: 'info'
        });
        break;
    }

    Logger.debug(`Mostrando ${tips.length} tips para el paso ${step}`);
    return tips;
  };

  const renderTip = (tip: Tip) => {
    const iconClass = {
      info: 'text-blue-500',
      suggestion: 'text-green-500',
      warning: 'text-yellow-500'
    }[tip.type];

    const bgClass = {
      info: 'bg-blue-50',
      suggestion: 'bg-green-50',
      warning: 'bg-yellow-50'
    }[tip.type];

    return (
      <motion.div
        key={tip.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-start gap-3 p-4 rounded-xl ${bgClass} mb-3`}
      >
        <div className={`mt-1 ${iconClass}`}>
          {tip.type === 'info' ? (
            <InformationCircleIcon className="w-5 h-5" />
          ) : (
            <LightBulbIcon className="w-5 h-5" />
          )}
        </div>
        <p className="text-sm text-gray-700">{tip.text}</p>
      </motion.div>
    );
  };

  const tips = getTips();

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {tips.map(renderTip)}
      </AnimatePresence>
    </div>
  );
} 