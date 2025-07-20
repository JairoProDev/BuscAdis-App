'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmpleoDetailProps {
  publication: PublicationData;
}

export default function EmpleoDetail({ publication }: EmpleoDetailProps) {
  // Employment specific data structure
  const empleoData = {
    salario: publication.value || 0,
    tipoTrabajo: 'Tiempo completo', // This would come from publication attributes
    modalidad: 'Presencial', // This would come from publication attributes
    experiencia: 'Intermedio', // This would come from publication attributes
    educacion: 'Universitario', // This would come from publication attributes
    beneficios: ['Seguro médico', 'Vacaciones pagadas', 'Bonos'], // From attributes
    requisitos: ['Experiencia previa', 'Manejo de Excel', 'Inglés básico'], // From attributes
    empresa: 'Empresa Confidencial', // From publication
    sector: 'Tecnología' // From publication attributes
  };

  const formatSalary = (value: number) => {
    if (!value || value === 0) return 'Salario a convenir';
    return `S/ ${value.toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return 'Hace algunos días';
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-xl">
            <BriefcaseIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                💼 Empleo
              </span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                {empleoData.tipoTrabajo}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {publication.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                {publication.location?.district || 'Lima'}, {publication.location?.province || 'Lima'}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {formatDate(publication.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <CurrencyDollarIcon className="w-4 h-4" />
                {formatSalary(publication.value || 0)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Job Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            Información de la Empresa
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Empresa</p>
              <p className="font-medium text-gray-900 dark:text-white">{empleoData.empresa}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sector</p>
              <p className="font-medium text-gray-900 dark:text-white">{empleoData.sector}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Modalidad</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {empleoData.modalidad}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Job Requirements */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-purple-600" />
            Requisitos
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Experiencia</p>
              <p className="font-medium text-gray-900 dark:text-white">{empleoData.experiencia}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Educación</p>
              <p className="font-medium text-gray-900 dark:text-white">{empleoData.educacion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Habilidades requeridas</p>
              <div className="flex flex-wrap gap-2">
                {empleoData.requisitos.map((requisito, index) => (
                  <li key={`requisito-${index}-${requisito.substring(0, 10).replace(/\s+/g, '-')}`} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{requisito}</span>
                  </li>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Job Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-yellow-600" />
          Beneficios y Compensación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Salario</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatSalary(publication.value || 0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">mensual</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Beneficios adicionales</p>
            <div className="space-y-2">
              {empleoData.beneficios.map((beneficio, index) => (
                <div key={`beneficio-${index}-${beneficio.substring(0, 10).replace(/\s+/g, '-')}`} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{beneficio}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Job Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Descripción del Puesto
        </h3>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {publication.description}
          </p>
        </div>
      </motion.div>

      {/* Application Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          💡 Consejos para Postular
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Antes de postular:</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Revisa si cumples con los requisitos</li>
              <li>• Personaliza tu CV para este puesto</li>
              <li>• Investiga sobre la empresa</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">En tu postulación:</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Menciona por qué te interesa el puesto</li>
              <li>• Destaca tu experiencia relevante</li>
              <li>• Sé profesional y cordial</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 