'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/components/shared/Container';

export default function CallToAction() {
  return (
    <section className="py-24 bg-primary-800">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Únete a la comunidad líder en clasificados premium y descubre un mundo de oportunidades
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/publicar"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-900 bg-white rounded-xl shadow-lg hover:bg-primary-50 transform hover:scale-105 transition-all duration-300"
            >
              Publicar Anuncio
            </Link>
            <Link
              href="/buscar"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-primary-700 rounded-xl shadow-lg hover:bg-primary-600 transform hover:scale-105 transition-all duration-300"
            >
              Explorar Anuncios
            </Link>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-blue-100"
          >
            Más de 15,000 usuarios ya confían en nosotros
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
} 