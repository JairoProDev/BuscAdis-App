'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileService } from '@/services/profile.service';
import { BuscadisAvatarIcon } from '@/components/icons/BuscadisAvatarIcon';

// Íconos de Heroicons
import {
  // UserCircleIcon as UserAvatarIcon, // Renombrado para claridad
  PencilSquareIcon, // Para botón de editar
  CheckCircleIcon, // Para éxito
  ExclamationTriangleIcon, // Para errores o advertencias
  ArrowPathIcon, // Para indicar guardado/carga
  CameraIcon, // Para cambiar avatar
  IdentificationIcon, // Para Nombre
  EnvelopeIcon, // Para Email
  DocumentTextIcon, // Para Biografía (ejemplo)
  UserIcon,
  BriefcaseIcon,
  CalendarIcon,
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  PaperClipIcon,
  HomeIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

// Componente LoadingSpinner (asumiendo que tienes uno similar al del Header)
const LoadingSpinner = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  return (
    <svg 
      className={`animate-spin text-teal-500 ${sizeClasses[size]} ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
};


// Interfaz para los datos del usuario de useAuth (consistente y específica)
interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string; // Si `useAuth` ya lo provee combinado
  phone?: string;
  email?: string;
  avatarUrl?: string; // URL del avatar actual
}

// Interfaz para los datos del formulario y el perfil que se manejan en esta página
interface ProfileFormData {
  fullName: string;
  phone: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  occupation?: string;
  gender?: string;
  birthdate?: string;
}

// 2. Barra de progreso de perfil y badges
const ProfileProgress = ({ percent }: { percent: number }) => (
  <div className="w-full flex flex-col items-center mb-6">
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute top-0 left-0" width="128" height="128">
        <circle cx="64" cy="64" r="56" stroke="#e0e7ef" strokeWidth="12" fill="none" />
        <circle cx="64" cy="64" r="56" stroke="url(#buscadis-avatar-gradient)" strokeWidth="12" fill="none" strokeDasharray={2 * Math.PI * 56} strokeDashoffset={2 * Math.PI * 56 * (1 - percent / 100)} strokeLinecap="round" />
        <defs>
          <linearGradient id="buscadis-avatar-gradient" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14b8a6" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <span className="relative z-10 text-3xl font-bold text-teal-500">{percent}%</span>
    </div>
    <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">Progreso de tu cartilla BuscAdis</span>
  </div>
);

// 3. Chips de intereses y categorías
const INTERESTS = [
  { label: 'Empleo', value: 'empleo', icon: BriefcaseIcon },
  { label: 'Vivienda', value: 'vivienda', icon: HomeIcon },
  { label: 'Servicios', value: 'servicios', icon: GlobeAltIcon },
  { label: 'Productos', value: 'productos', icon: ShoppingBagIcon },
  { label: 'Otro', value: 'otro', icon: PlusIcon },
];

// 4. Redes sociales disponibles
const SOCIALS = [
  { label: 'WhatsApp', value: 'whatsapp', icon: WhatsAppIcon },
  { label: 'Facebook', value: 'facebook', icon: GlobeAltIcon },
  { label: 'LinkedIn', value: 'linkedin', icon: GlobeAltIcon },
  { label: 'Instagram', value: 'instagram', icon: GlobeAltIcon },
];

export default function PerfilPage() {
  const { user, isAuthenticated, loading: authIsLoading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSaving] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    phone: '',
    email: '',
    bio: '',
    avatarUrl: '', // Podría ser URL o File object si permites subida
  });

  const initialFormDataRef = useRef<ProfileFormData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Para la subida de avatar

  const [phones, setPhones] = useState([{ value: '', type: 'main' }]);
  const [interests, setInterests] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<{ type: string; url: string }[]>([]);
  const [profileProgress] = useState(40); // Calcular dinámicamente luego

  // Efecto para cargar datos del perfil
  useEffect(() => {
    console.log('[PERFIL_PAGE_AUTH] authIsLoading:', authIsLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);
    if (authIsLoading) {
      setPageLoading(true); // Mostrar spinner de página si la autenticación aún está cargando
      return;
    }

    if (!isAuthenticated || !user?.id) {
      setPageLoading(false);
      setFormData(normalizeAuthUserToProfile(null)); // Limpiar formulario
      return;
    }

    const fetchProfile = async () => {
      setPageLoading(true);
      try {
        const profileDataFromService = await ProfileService.getProfile(); // Devuelve ProfileFormData o similar

        let dataToSet: ProfileFormData;
        const baseAuthData = normalizeAuthUserToProfile(user); // Datos base del hook de autenticación

        if (profileDataFromService && Object.keys(profileDataFromService).length > 0) {
          dataToSet = {
            fullName: profileDataFromService.fullName || baseAuthData.fullName,
            phone: profileDataFromService.phone || baseAuthData.phone,
            email: profileDataFromService.email || baseAuthData.email, // El email podría ser no editable o venir de auth
            bio: profileDataFromService.bio || '',
            avatarUrl: profileDataFromService.avatarUrl || baseAuthData.avatarUrl,
          };
        } else {
          // Si no hay perfil en el servicio, usar datos de autenticación como base
          dataToSet = baseAuthData;
        }
        setFormData(dataToSet);
        initialFormDataRef.current = { ...dataToSet }; // Guardar estado inicial profundo
      } catch (err) {
        console.error('Error fetching profile:', err);
        // Fallback a datos del hook de autenticación si falla la carga del perfil detallado
        const fallbackData = normalizeAuthUserToProfile(user);
        setFormData(fallbackData);
        initialFormDataRef.current = { ...fallbackData };
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();

  }, [isAuthenticated, user, authIsLoading, normalizeAuthUserToProfile]);

  // Sincronizar phones con formData.phone al cargar el perfil
  useEffect(() => {
    setPhones([{ value: formData.phone, type: 'main' }]);
  }, [formData.phone]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (initialFormDataRef.current) {
      setFormData(initialFormDataRef.current); // Restaurar datos originales
    }
  };

  if (authIsLoading || pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center px-4">
        <LoadingSpinner size="xl" />
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
          {authIsLoading ? "Verificando tu sesión..." : "Cargando tu información de perfil..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16 max-w-lg mx-auto text-center px-4">
        <ExclamationTriangleIcon className="w-20 h-20 text-amber-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">Acceso Restringido</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Necesitas iniciar sesión para poder gestionar tu perfil.
        </p>
        <Link 
          href="/login"
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-150"
        >
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4 animate-fade-in">
      {/* Barra de progreso y avatar */}
      <div className="flex flex-col items-center mb-8">
        <ProfileProgress percent={profileProgress} />
        <div className="relative group mb-2">
          {formData.avatarUrl ? (
            <img src={formData.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover ring-4 ring-teal-300 shadow-lg" />
          ) : (
            <BuscadisAvatarIcon className="w-32 h-32 rounded-full ring-4 ring-teal-300 shadow-lg bg-white" />
          )}
          {isEditing && (
            <button type="button" title="Cambiar avatar" onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 p-2 bg-teal-500 hover:bg-teal-600 rounded-full shadow-md">
              <CameraIcon className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        <h1 className="text-3xl font-bold text-slate-50 mb-1">{formData.fullName || 'Tu Nombre'}</h1>
        <p className="text-slate-400 text-base mb-2">¡Estás creando tu cartilla BuscAdis! Entre más completo tu perfil, mejores resultados tendrás.</p>
      </div>
      {/* Sección de intereses */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2"><UserIcon className="w-5 h-5" /> ¿Qué estás buscando?</h2>
        <div className="flex flex-wrap gap-3 mb-2">
          {INTERESTS.map((interest) => (
            <button
              key={interest.value}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-colors font-medium text-sm ${interests.includes(interest.value) ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-teal-500' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white/10 hover:bg-teal-500/10'}`}
              onClick={() => setInterests((prev) => prev.includes(interest.value) ? prev.filter(i => i !== interest.value) : [...prev, interest.value])}
            >
              <interest.icon className="w-5 h-5" /> {interest.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400">Selecciona una o varias opciones para personalizar tu experiencia.</p>
      </section>
      {/* Sección de datos personales y contacto */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2"><IdentificationIcon className="w-5 h-5" /> Datos personales</h2>
        {/* Nombre, sexo, fecha de nacimiento, ocupación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField label="Nombre Completo" id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} placeholder="Ej: Jairo S. Quiñones" disabled={!isEditing || isSaving} icon={IdentificationIcon} />
          <FormField label="Ocupación" id="occupation" name="occupation" type="text" value={formData.occupation || ''} onChange={handleInputChange} placeholder="Ej: Desarrollador, Estudiante..." disabled={!isEditing || isSaving} icon={BriefcaseIcon} />
          <FormField label="Sexo" id="gender" name="gender" type="text" value={formData.gender || ''} onChange={handleInputChange} placeholder="Ej: Masculino, Femenino, Otro..." disabled={!isEditing || isSaving} icon={UserIcon} />
          <FormField label="Fecha de Nacimiento" id="birthdate" name="birthdate" type="date" value={formData.birthdate || ''} onChange={handleInputChange} placeholder="" disabled={!isEditing || isSaving} icon={CalendarIcon} />
        </div>
        {/* Teléfonos/WhatsApp */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Teléfonos / WhatsApp</label>
          <div className="flex flex-col gap-2">
            {phones.map((phone, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="tel" value={phone.value} onChange={e => setPhones(phones.map((p, i) => i === idx ? { ...p, value: e.target.value } : p))} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/70" placeholder="Ej: +51 987 654 321" disabled={!isEditing || isSaving} />
                {phones.length > 1 && isEditing && <button type="button" title="Eliminar número" onClick={() => setPhones(phones.filter((_, i) => i !== idx))} className="p-1.5 rounded-full bg-red-100 hover:bg-red-200"><TrashIcon className="w-4 h-4 text-red-500" /></button>}
              </div>
            ))}
            {isEditing && <button type="button" title="Agregar otro número" onClick={() => setPhones([...phones, { value: '', type: 'other' }])} className="flex items-center gap-1 text-teal-500 hover:underline text-sm mt-1"><PlusIcon className="w-4 h-4" /> Agregar otro número</button>}
          </div>
        </div>
        {/* Correo electrónico */}
        <FormField label="Correo Electrónico" id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="tu@correo.com" disabled={!isEditing || isSaving} icon={EnvelopeIcon} />
      </section>
      {/* Sección de redes sociales */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2"><GlobeAltIcon className="w-5 h-5" /> Redes sociales</h2>
        <div className="flex flex-col gap-2 mb-2">
          {socialLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select value={link.type} title="Tipo de red social" onChange={e => setSocialLinks(socialLinks.map((l, i) => i === idx ? { ...l, type: e.target.value } : l))} className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/70" disabled={!isEditing || isSaving}>
                {SOCIALS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <input type="url" value={link.url} onChange={e => setSocialLinks(socialLinks.map((l, i) => i === idx ? { ...l, url: e.target.value } : l))} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/70" placeholder="URL de tu perfil" disabled={!isEditing || isSaving} />
              {isEditing && <button type="button" title="Eliminar red social" onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))} className="p-1.5 rounded-full bg-red-100 hover:bg-red-200"><TrashIcon className="w-4 h-4 text-red-500" /></button>}
            </div>
          ))}
          {isEditing && <button type="button" title="Agregar red social" onClick={() => setSocialLinks([...socialLinks, { type: 'whatsapp', url: '' }])} className="flex items-center gap-1 text-teal-500 hover:underline text-sm mt-1"><PlusIcon className="w-4 h-4" /> Agregar red social</button>}
        </div>
      </section>
      {/* Sección de CV y biografía */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2"><PaperClipIcon className="w-5 h-5" /> CV y presentación</h2>
        <div className="mb-4">
          <label htmlFor="cv" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sube tu CV (PDF, opcional)</label>
          <input type="file" id="cv" name="cv" accept="application/pdf" className="block w-full text-sm text-slate-700 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" disabled={!isEditing || isSaving} />
        </div>
        <FormField label="Sobre mí (Biografía breve)" id="bio" name="bio" type="text" value={formData.bio || ''} onChange={handleInputChange} placeholder="Cuéntanos un poco sobre ti, tus intereses o lo que ofreces..." disabled={!isEditing || isSaving} icon={DocumentTextIcon} />
      </section>
      {/* Mensaje de seguridad y motivación */}
      <div className="mb-8 text-center text-slate-400 text-sm">
        <CheckCircleIcon className="w-6 h-6 inline-block text-teal-400 mr-2" /> Tu información está segura. Solo la usaremos para mejorar tu experiencia en BuscAdis.
      </div>
      {/* Botones de acción */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
        {!isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-slate-800 hover:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all duration-150">
            <PencilSquareIcon className="w-5 h-5" /> Editar Perfil
          </button>
        ) : (
          <>
            <button type="button" onClick={handleCancelEdit} disabled={isSaving} className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors duration-150 disabled:opacity-60">Cancelar</button>
            <button type="submit" disabled={isSaving} className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-150 disabled:opacity-70">{isSaving ? (<><ArrowPathIcon className="w-5 h-5 animate-spin" /> Guardando...</>) : (<><CheckCircleIcon className="w-5 h-5" /> Guardar Cambios</>)}</button>
          </>
        )}
      </div>
    </div>
  );
}

// Componente reutilizable para los campos del formulario para mantener el JSX más limpio
interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled: boolean;
  icon?: React.ElementType; // Componente de ícono (ej. IdentificationIcon)
  error?: string; // Para mostrar errores de validación por campo
}

const FormField: React.FC<FormFieldProps> = ({ label, id, name, type, value, onChange, placeholder, disabled, icon: Icon, error }) => {
  const inputBaseClasses = "block w-full text-base rounded-lg border transition-colors duration-150 focus:ring-2 focus:outline-none dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";
  const inputEnabledClasses = "bg-white dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500 focus:ring-teal-500/40";
  const inputDisabledClasses = "bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400";
  const inputErrorClasses = "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500/40";
  
  const inputIconWrapperClasses = "relative";
  const inputIconClasses = "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none";
  const inputPadding = Icon ? "pl-11 pr-3.5 py-2.5" : "px-3.5 py-2.5";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className={inputIconWrapperClasses}>
        {Icon && <Icon className={inputIconClasses} />}
        <input
          type={type}
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${inputBaseClasses} ${disabled ? inputDisabledClasses : (error ? inputErrorClasses : inputEnabledClasses)} ${inputPadding}`}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1.5" /> {error}
        </p>
      )}
    </div>
  );
};

// Normalizar datos del AuthUser a ProfileFormData
const normalizeAuthUserToProfile = (authUser: AuthUser | null): ProfileFormData => {
  if (!authUser) return { fullName: '', phone: '', email: '', bio: '', avatarUrl: '' };
  return {
    fullName: authUser.fullName || `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
    phone: authUser.phone || '',
    email: authUser.email || '',
    bio: '', // Asumimos que bio no viene de AuthUser, sino del perfil específico
    avatarUrl: authUser.avatarUrl || '',
  };
};