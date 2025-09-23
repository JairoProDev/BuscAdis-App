
import React from 'react';
import { PublicationData } from '@/types/publication';
import { WhatsAppIcon } from '@/components/icons';

interface PublicationContactProps {
  publication: PublicationData;
}

const generateWhatsAppMessage = (publication: PublicationData) => {
  const adUrl = typeof window !== 'undefined' ? window.location.href : '';
  const categoryName = publication.categorySlug.charAt(0).toUpperCase() + publication.categorySlug.slice(1);

  switch (publication.categorySlug) {
    case 'empleos':
      return `🔍 Hola, vi su adiso de *${categoryName}* en BuscaDis.com y me interesó mucho la oportunidad:\n\n"${publication.title}"\n\n¿Podría brindarme más información sobre los requisitos y el proceso de selección? Estoy muy interesado/a en aplicar.\n\n🔗 Link del adiso: ${adUrl}\n\n¡Gracias por su tiempo! 😊`;
    case 'inmuebles':
      return `🏠 Hola, vi su publicación de *${categoryName}* en BuscaDis.com y me interesó el inmueble:\n\n"${publication.title}"\n\n¿Podría proporcionarme más detalles sobre las características, disponibilidad y condiciones? Me gustaría coordinar una visita si es posible.\n\n🔗 Link del adiso: ${adUrl}\n\n¡Quedo atento/a a su respuesta! 😊`;
    case 'vehiculos':
      return `🚗 Hola, vi su adiso de *${categoryName}* en BuscaDis.com y me interesó el vehículo:\n\n"${publication.title}"\n\n¿Podría brindarme más información sobre el estado, historial y documentación? Me gustaría conocer más detalles para una posible compra.\n\n🔗 Link del adiso: ${adUrl}\n\n¡Gracias por su atención! 😊`;
    case 'servicios':
      return `🛠️ Hola, vi su oferta de *${categoryName}* en BuscaDis.com y necesito información sobre:\n\n"${publication.title}"\n\n¿Podría contarme más sobre su experiencia, tarifas y disponibilidad? Estoy interesado/a en contratar este servicio.\n\n🔗 Link del adiso: ${adUrl}\n\n¡Espero su respuesta! 😊`;
    case 'productos':
      return `🛍️ Hola, vi su producto en BuscaDis.com y me interesó:\n\n"${publication.title}"\n\n¿Podría brindarme más información sobre las especificaciones, garantía y formas de pago disponibles?\n\n🔗 Link del adiso: ${adUrl}\n\n¡Gracias! 😊`;
    default:
      return `👋 Hola, vi su adiso de *${categoryName}* en BuscaDis.com y me interesó:\n\n"${publication.title}"\n\n¿Podría brindarme más información al respecto? Estoy muy interesado/a.\n\n🔗 Link del adiso: ${adUrl}\n\n¡Quedo atento/a a su respuesta! 😊`;
  }
};

const PublicationContact: React.FC<PublicationContactProps> = ({ publication }) => {
  const handleWhatsAppClick = () => {
    if (publication.whatsapp) {
      const cleanPhone = publication.whatsapp.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(generateWhatsAppMessage(publication));
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Contactar al anunciante
      </h3>
      <div className="flex flex-col sm:flex-row gap-4">
        {publication.whatsapp && (
          <button
            onClick={handleWhatsAppClick}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors shadow-md"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Contactar por WhatsApp
          </button>
        )}
        {/* Add other contact options here if available, e.g., phone call, email */}
      </div>
    </div>
  );
};

export default PublicationContact;
