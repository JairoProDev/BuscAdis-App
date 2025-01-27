'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ContactInfo as ContactInfoType } from '@/types/publish'
import { 
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface ContactInfoProps {
  value: ContactInfoType
  onChange: (info: ContactInfoType) => void
  className?: string
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return `${hour}:00`
})

export default function ContactInfo({
  value,
  onChange,
  className = ''
}: ContactInfoProps) {
  const [showAvailability, setShowAvailability] = useState(false)

  const handleChange = (field: keyof ContactInfoType, fieldValue: any) => {
    onChange({
      ...value,
      [field]: fieldValue
    })
  }

  return (
    <div className={className}>
      {/* Name Input */}
      <div className="mb-6">
        <label htmlFor="contact-name" className="block text-sm font-medium text-primary-700 mb-2">
          Nombre de contacto
        </label>
        <input
          id="contact-name"
          type="text"
          value={value.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="Tu nombre o el de tu empresa"
        />
      </div>

      {/* Email Input */}
      <div className="mb-6">
        <label htmlFor="contact-email" className="block text-sm font-medium text-primary-700 mb-2">
          Correo electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="w-5 h-5 text-primary-500" />
          </div>
          <input
            id="contact-email"
            type="email"
            value={value.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="correo@ejemplo.com"
          />
          <button
            onClick={() => handleChange('showEmail', !value.showEmail)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label={value.showEmail ? 'Ocultar correo' : 'Mostrar correo'}
          >
            {value.showEmail ? (
              <EyeIcon className="w-5 h-5 text-primary-500" />
            ) : (
              <EyeSlashIcon className="w-5 h-5 text-primary-500" />
            )}
          </button>
        </div>
      </div>

      {/* Phone Input */}
      <div className="mb-6">
        <label htmlFor="contact-phone" className="block text-sm font-medium text-primary-700 mb-2">
          Teléfono (opcional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <PhoneIcon className="w-5 h-5 text-primary-500" />
          </div>
          <input
            id="contact-phone"
            type="tel"
            value={value.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="+51 987 654 321"
          />
          <button
            onClick={() => handleChange('showPhone', !value.showPhone)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label={value.showPhone ? 'Ocultar teléfono' : 'Mostrar teléfono'}
          >
            {value.showPhone ? (
              <EyeIcon className="w-5 h-5 text-primary-500" />
            ) : (
              <EyeSlashIcon className="w-5 h-5 text-primary-500" />
            )}
          </button>
        </div>
      </div>

      {/* WhatsApp Input */}
      <div className="mb-6">
        <label htmlFor="contact-whatsapp" className="block text-sm font-medium text-primary-700 mb-2">
          WhatsApp (opcional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-primary-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <input
            id="contact-whatsapp"
            type="tel"
            value={value.whatsapp || ''}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="+51 987 654 321"
          />
          <button
            onClick={() => handleChange('showWhatsapp', !value.showWhatsapp)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label={value.showWhatsapp ? 'Ocultar WhatsApp' : 'Mostrar WhatsApp'}
          >
            {value.showWhatsapp ? (
              <EyeIcon className="w-5 h-5 text-primary-500" />
            ) : (
              <EyeSlashIcon className="w-5 h-5 text-primary-500" />
            )}
          </button>
        </div>
      </div>

      {/* Preferred Contact Method */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary-700 mb-2">
          Método de contacto preferido
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleChange('preferredContact', 'email')}
            className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm transition-colors ${
              value.preferredContact === 'email'
                ? 'bg-primary-500 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
            aria-label="Preferir contacto por correo"
          >
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            Correo
          </button>
          <button
            onClick={() => handleChange('preferredContact', 'phone')}
            className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm transition-colors ${
              value.preferredContact === 'phone'
                ? 'bg-primary-500 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
            aria-label="Preferir contacto por teléfono"
          >
            <PhoneIcon className="w-5 h-5 mr-2" />
            Teléfono
          </button>
          <button
            onClick={() => handleChange('preferredContact', 'whatsapp')}
            className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm transition-colors ${
              value.preferredContact === 'whatsapp'
                ? 'bg-primary-500 text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
            aria-label="Preferir contacto por WhatsApp"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>

      {/* Availability Hours */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-primary-700">
            Horario de contacto (opcional)
          </label>
          <button
            onClick={() => setShowAvailability(!showAvailability)}
            className="text-primary-500 hover:text-primary-600 text-sm"
            aria-label={showAvailability ? 'Ocultar horario' : 'Mostrar horario'}
          >
            {showAvailability ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {showAvailability && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="time-from" className="block text-sm text-primary-600 mb-1">
                  Desde
                </label>
                <select
                  id="time-from"
                  value={value.availableHours?.from || '09:00'}
                  onChange={(e) => handleChange('availableHours', {
                    ...value.availableHours,
                    from: e.target.value
                  })}
                  className="w-full px-4 py-2 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="time-to" className="block text-sm text-primary-600 mb-1">
                  Hasta
                </label>
                <select
                  id="time-to"
                  value={value.availableHours?.to || '18:00'}
                  onChange={(e) => handleChange('availableHours', {
                    ...value.availableHours,
                    to: e.target.value
                  })}
                  className="w-full px-4 py-2 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm text-primary-600 mb-1">
                Zona horaria
              </label>
              <select
                id="timezone"
                value={value.availableHours?.timezone || 'America/Bogota'}
                onChange={(e) => handleChange('availableHours', {
                  ...value.availableHours,
                  timezone: e.target.value
                })}
                className="w-full px-4 py-2 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              >
                <option value="America/Bogota">Bogotá (GMT-5)</option>
                <option value="America/Lima">Lima (GMT-5)</option>
                <option value="America/Caracas">Caracas (GMT-4)</option>
                <option value="America/Santiago">Santiago (GMT-4)</option>
                <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-primary-50 rounded-xl"
      >
        <h4 className="text-sm font-medium text-primary-700 mb-4">
          Vista previa de la información de contacto
        </h4>
        <div className="space-y-2">
          <div className="flex items-center text-primary-600">
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            {value.showEmail ? value.email : '••••••@••••••'}
          </div>
          {value.phone && (
            <div className="flex items-center text-primary-600">
              <PhoneIcon className="w-5 h-5 mr-2" />
              {value.showPhone ? value.phone : '••• ••• ••••'}
            </div>
          )}
          {value.whatsapp && (
            <div className="flex items-center text-primary-600">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {value.showWhatsapp ? value.whatsapp : '••• ••• ••••'}
            </div>
          )}
          {value.availableHours && (
            <div className="flex items-center text-primary-600">
              <ClockIcon className="w-5 h-5 mr-2" />
              {`${value.availableHours.from} - ${value.availableHours.to}`}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 