// src/components/publish/ContactForm.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { PhoneIcon, EnvelopeIcon, UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service'; // Asumiendo que existe
import { Publication } from '@/types/publication'; // Importa la interfaz final
import { PhoneInput } from 'react-international-phone'; // Usa la librería si está disponible
import 'react-international-phone/style.css'; // Estilos para PhoneInput

// Tipo para el valor del formulario de contacto
type ContactFormData = Publication['contact'];

interface ContactFormProps {
  initialValue?: Partial<ContactFormData>; // Puede recibir datos parciales
  onChange: (contactData: ContactFormData) => void;
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({
  initialValue: value,
  onChange,
  className = ''
}) => {
  // Estado interno para los campos del formulario
  const [name, setName] = useState(value?.name || '');
  const [email, setEmail] = useState(value?.email || '');
  // Usa el primer teléfono para PhoneInput, maneja el array completo al notificar
  const [primaryPhone, setPrimaryPhone] = useState(value?.phones?.[0] || '');
  const [website, setWebsite] = useState(value?.website || ''); // Añadido

  // Sincronizar si las props cambian
  useEffect(() => {
      setName(value?.name || '');
      setEmail(value?.email || '');
      setPrimaryPhone(value?.phones?.[0] || '');
      setWebsite(value?.website || '');
  }, [value]);


  // Función para notificar al componente padre
  const notifyChange = useCallback(() => {
      // Construye el objeto de contacto con la estructura final
      // Por ahora, solo manejamos el primer teléfono del array simple
      const updatedPhones = primaryPhone.trim() ? [primaryPhone.trim()] : [];
      onChange({
          name: name || null, // Enviar null si está vacío
          email: email || null,
          phones: updatedPhones,
          website: website || null,
      });
  }, [name, email, primaryPhone, website, onChange]);

  // Handlers para cada input, llamando a notifyChange en onBlur
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value);
  // Para PhoneInput, actualiza al cambiar y notifica (o en onBlur si prefieres)
  const handlePhoneInputChange = (phoneValue: string) => {
     setPrimaryPhone(phoneValue);
     // Notificar inmediatamente o esperar a onBlur del componente padre?
     // Por simplicidad, notificamos aquí, pero puede ser ineficiente
     const updatedPhones = phoneValue.trim() ? [phoneValue.trim()] : [];
      onChange({
          name: name || null,
          email: email || null,
          phones: updatedPhones,
          website: website || null,
      });
  };


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Nombre */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-primary-700 mb-1">
          Nombre de Contacto (Opcional)
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
                id="contact-name" type="text" value={name}
                onChange={handleNameChange} onBlur={notifyChange} // Notifica en Blur
                className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                placeholder="Tu nombre o el de tu empresa"
            />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-primary-700 mb-1">
           Correo Electrónico (Opcional)
        </label>
         <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
                id="contact-email" type="email" value={email ?? ''}
                onChange={handleEmailChange} onBlur={notifyChange} // Notifica en Blur
                className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                placeholder="tu@correo.com"
            />
         </div>
      </div>

       {/* Teléfono Principal (WhatsApp preferido) */}
      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium text-primary-700 mb-1">
          Teléfono / WhatsApp Principal *
        </label>
         {/* Usando react-international-phone */}
         <PhoneInput
             defaultCountry="pe" // Perú por defecto
             value={primaryPhone}
             onChange={handlePhoneInputChange} // Actualiza y notifica
             inputClassName="!w-full !py-2 !pl-14 !pr-4 !bg-white !rounded-lg !border !border-gray-300 !focus:border-primary-500 !focus:ring-1 !focus:ring-primary-500 !transition-all" // Clases para el input interno
             countrySelectorStyleProps={{buttonClassName:"!border-gray-300 !rounded-l-lg !bg-gray-50"}}
             inputProps={{
                id: 'contact-phone',
                name: 'primaryPhone', // Nombre para el input
                required: true, // Hacerlo requerido
             }}

          />
          <p className="text-xs text-gray-500 mt-1">Ingresa tu número principal. Se usará para WhatsApp si es válido.</p>
          {/* Aquí podrías añadir lógica para más teléfonos si fuera necesario */}
      </div>

       {/* Website (Opcional) */}
       <div>
        <label htmlFor="contact-website" className="block text-sm font-medium text-primary-700 mb-1">
          Sitio Web o Red Social (Opcional)
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GlobeAltIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
                id="contact-website" type="url" value={website ?? ''}
                onChange={handleWebsiteChange} onBlur={notifyChange} // Notifica en Blur
                className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                placeholder="https://tuweb.com"
            />
         </div>
      </div>

    </div>
  );
};

export default ContactForm;