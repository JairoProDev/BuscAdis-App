// ContactStep.tsx
'use client';

import React, { useState } from 'react';
import { QuickPublicationData } from '@/services/publications.service';
// import LocationSelector from '@/components/publish/LocationSelector';
import PriceSelector from '@/components/publish/PriceSelector';
import { PhoneInput } from 'react-international-phone';
import { motion } from 'framer-motion';
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ContactStepProps {
  ad: QuickPublicationData;
  setAd: React.Dispatch<React.SetStateAction<QuickPublicationData>>;
  onNext: () => void;
  onPrevious: () => void;
}

const ContactStep: React.FC<ContactStepProps> = ({ ad, setAd, onNext, onPrevious }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium text-primary-700 mb-2">
          WhatsApp *
        </label>
        <PhoneInput
          defaultCountry="pe"
          value={ad.contact.whatsapp}
          onChange={(phone) => setAd({
            ...ad,
            contact: {
              ...ad.contact,
              whatsapp: phone
            }
          })}
          className="w-full"
        />
      </div>
{/*
      <LocationSelector
        value={ad.location}
        onChange={(location) => setAd({ ...ad, location })}
      />
*/}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full px-4 py-2 text-sm text-primary-600 hover:text-primary-800 transition-colors flex items-center justify-center gap-2"
      >
        <SparklesIcon className="w-5 h-5" />
        {showAdvanced ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
      </button>

      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6 pt-4"
        >
          <PriceSelector
            value={ad.price}
            onChange={(price) => setAd({ ...ad, price })}
          />
        </motion.div>
      )}

      <div className="flex justify-between pt-4">
        <button onClick={onPrevious} className="px-6 py-3 flex items-center gap-2 text-primary-600 hover:text-primary-800"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Anterior
        </button>
        <button
          onClick={onNext}
          disabled={!ad.contact.whatsapp}
          className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Siguiente
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ContactStep;