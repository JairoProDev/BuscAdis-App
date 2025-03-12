import { motion } from 'framer-motion';

const steps = [
  {
    icon: '✏️',
    title: 'Crea tu anuncio',
    description: 'Publica tu anuncio de forma rápida y sencilla. Agrega fotos, descripción y todos los detalles necesarios.'
  },
  {
    icon: '👀',
    title: 'Haz que te vean',
    description: 'Llega a miles de personas interesadas en lo que ofreces. ¡La visibilidad adecuada hace la diferencia!'
  },
  {
    icon: '💬',
    title: 'Recibe contactos',
    description: 'Recibe mensajes de WhatsApp o correos de personas interesadas directamente a tu información de contacto.'
  },
  {
    icon: '🤝',
    title: 'Concreta negocios',
    description: 'Cierra tratos exitosos y aprovecha todas las oportunidades que Buscadis te ofrece.'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-primary-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Publica un anuncio en minutos y conecta con personas interesadas en lo que ofreces
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-6 text-center"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
