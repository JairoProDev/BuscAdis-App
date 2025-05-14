'use client';

import React, { useState, useEffect, useCallback, useRef, FormEvent, ChangeEvent } from 'react';
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
  DevicePhoneMobileIcon, // Para Teléfono
  EnvelopeIcon, // Para Email
  DocumentTextIcon, // Para Biografía (ejemplo)
} from '@heroicons/react/24/outline';

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
  bio?: string; // Nuevo campo de ejemplo
  avatarUrl?: string; // Podría ser un File para subida o string para URL
}

// Componente Toast de Notificación (similar al del Header, podrías centralizarlo)
const ToastNotification = ({
  id,
  message,
  type,
  onDismiss,
}: {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: (id: string) => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 5000); // Aumentado tiempo y dismissal por ID
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const baseClasses = "fixed top-20 right-5 z-[10000] w-auto max-w-sm px-5 py-3.5 rounded-xl shadow-2xl transform transition-all duration-300 ease-out";
  const typeStyles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-blue-600 text-white",
  };
  // Iconos para el Toast
  const TypeIcon = type === 'success' ? CheckCircleIcon : type === 'error' ? ExclamationTriangleIcon : null;

  // Animación de entrada desde la derecha y salida
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true); // Inicia animación de entrada
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300); // Espera a que la animación de salida termine
  };

  return (
    <div 
      className={`${baseClasses} ${typeStyles[type]} ${isVisible ? 'translate-x-0 opacity-100 animate-slide-in-from-right' : 'translate-x-full opacity-0'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center">
        {TypeIcon && <TypeIcon className="w-6 h-6 mr-3 flex-shrink-0" />}
        <p className="text-sm font-medium">{message}</p>
        <button 
            onClick={handleDismiss} 
            className="ml-auto -mr-1 p-1.5 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
            aria-label="Cerrar notificación"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
        </button>
      </div>
    </div>
  );
};


export default function PerfilPage() {
  const { user, isAuthenticated, loading: authIsLoading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [notifications, setNotifications] = useState<{id: string; message: string; type: 'success' | 'error' | 'info'}[]>([]);

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    phone: '',
    email: '',
    bio: '',
    avatarUrl: '', // Podría ser URL o File object si permites subida
  });

  const initialFormDataRef = useRef<ProfileFormData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Para la subida de avatar

  // Función para añadir notificaciones (toasts)
  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString(); // ID simple basado en timestamp
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // Normalizar datos del AuthUser a ProfileFormData
  const normalizeAuthUserToProfile = useCallback((authUser: AuthUser | null): ProfileFormData => {
    if (!authUser) return { fullName: '', phone: '', email: '', bio: '', avatarUrl: '' };
    return {
      fullName: authUser.fullName || `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
      phone: authUser.phone || '',
      email: authUser.email || '',
      bio: '', // Asumimos que bio no viene de AuthUser, sino del perfil específico
      avatarUrl: authUser.avatarUrl || '',
    };
  }, []);

  // Efecto para cargar datos del perfil
  useEffect(() => {
    console.log('[PERFIL_PAGE_AUTH] authIsLoading:', authIsLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);
    if (authIsLoading) {
      setPageLoading(true); // Mostrar spinner de página si la autenticación aún está cargando
      return;
    }

    if (!isAuthenticated || !user?.id) {
      setPageLoading(false);
      addNotification('Debes iniciar sesión para ver tu perfil.', 'error');
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
          addNotification('No se encontró un perfil detallado, puedes crear uno ahora.', 'info');
        }
        setFormData(dataToSet);
        initialFormDataRef.current = { ...dataToSet }; // Guardar estado inicial profundo
      } catch (err) {
        console.error('Error fetching profile:', err);
        addNotification('No se pudo cargar tu perfil. Se usarán datos básicos.', 'error');
        // Fallback a datos del hook de autenticación si falla la carga del perfil detallado
        const fallbackData = normalizeAuthUserToProfile(user);
        setFormData(fallbackData);
        initialFormDataRef.current = { ...fallbackData };
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();

  }, [isAuthenticated, user, authIsLoading, addNotification, normalizeAuthUserToProfile]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Aquí manejarías la subida del archivo (ej. a un estado o directamente a un servicio)
      // Por ahora, solo mostramos un placeholder o la URL local para previsualización
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
      addNotification('Avatar seleccionado. Guarda los cambios para aplicarlo.', 'info');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    if (!formData.fullName.trim()) {
      addNotification("El nombre completo es requerido.", 'error');
      return;
    }
    // Añadir más validaciones si es necesario

    if (JSON.stringify(formData) === JSON.stringify(initialFormDataRef.current)) {
      addNotification("No se detectaron cambios para guardar.", 'info');
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // Aquí, si avatarUrl es un DataURL (de la subida local), necesitarías procesarlo
      // para subir el archivo y obtener la URL final antes de enviar a `createOrUpdateProfile`.
      // Por simplicidad, asumimos que ProfileService.createOrUpdateProfile puede manejarlo
      // o que ya tienes la URL si no se cambió el avatar.
      const updatedProfile = await ProfileService.createOrUpdateProfile(formData); // formData puede incluir el nuevo avatarUrl (string o File)

      setFormData(current => ({...current, ...updatedProfile})); // Actualiza con lo que devuelve el backend (ej. URL de avatar finalizada)
      initialFormDataRef.current = { ...formData, ...updatedProfile };
      addNotification('¡Perfil actualizado con éxito!', 'success');
      setIsEditing(false);

      // Si necesitas sincronizar el usuario global, usa la clave 'user' en localStorage.
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      addNotification((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'No se pudo actualizar el perfil.', 'error');
    } finally {
      setIsSaving(false);
    }
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

  // Estilos comunes para los inputs del formulario
  const inputBaseClasses = "block w-full text-base rounded-lg border transition-colors duration-150 focus:ring-2 focus:outline-none dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500";
  const inputEnabledClasses = "bg-white dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500 focus:ring-teal-500/40";
  const inputDisabledClasses = "bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400";
  const inputIconWrapperClasses = "relative";
  const inputIconClasses = "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500";
  const inputWithIconPadding = "pl-10 pr-3.5 py-2.5"; // Ajustado para el ícono
  // const inputWithoutIconPadding = "px-3.5 py-2.5";


  return (
    <div className="container max-w-4xl mx-auto py-12 md:py-20 px-4 animate-fade-in">
      {/* Contenedor de Notificaciones */}
      <div className="fixed top-5 right-5 z-[10000] space-y-3 w-full max-w-sm">
        {notifications.map(notif => (
          <ToastNotification
            key={notif.id}
            id={notif.id}
            message={notif.message}
            type={notif.type}
            onDismiss={dismissNotification}
          />
        ))}
      </div>

      {/* Encabezado de la Página de Perfil */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-10 md:mb-16">
        <div className="relative group">
          {formData.avatarUrl ? (
            <img
              src={formData.avatarUrl}
              alt="Avatar"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-slate-200 dark:ring-slate-700 shadow-lg"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }}
            />
          ) : (
            <BuscadisAvatarIcon className="w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-slate-200 dark:ring-slate-700 shadow-lg bg-white" />
          )}
          {isEditing && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                aria-label="Seleccionar nuevo avatar"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 bg-teal-500 hover:bg-teal-600 rounded-full shadow-md transition-all duration-150 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                aria-label="Cambiar avatar"
                title="Cambiar avatar"
              >
                <CameraIcon className="w-5 h-5 text-white" />
              </button>
            </>
          )}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">
            {isEditing ? "Actualiza tu Perfil" : (formData.fullName || "Mi Espacio Personal")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-base md:text-lg max-w-md">
            Mantén tu información al día para una mejor experiencia en BuscAdis.
          </p>
        </div>
      </div>

      {/* Formulario de Perfil */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-slate-800/60 rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 space-y-6 ring-1 ring-slate-900/5 dark:ring-white/10"
      >
        <FormField
          label="Nombre Completo"
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Ej: Jairo S. Quiñones"
          disabled={!isEditing || isSaving}
          icon={IdentificationIcon}
        />
        
        <FormField
          label="Teléfono de Contacto"
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Ej: +51 987 654 321"
          disabled={!isEditing || isSaving}
          icon={DevicePhoneMobileIcon}
        />

        <FormField
          label="Correo Electrónico"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="tu@correo.com"
          // El email usualmente no se edita o requiere un proceso de verificación aparte.
          // Aquí lo dejamos editable, pero considera la política de tu app.
          disabled={!isEditing || isSaving} 
          icon={EnvelopeIcon}
        />

        {/* Campo de Biografía (TextArea) */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Sobre mí (Biografía breve)
          </label>
          <div className={inputIconWrapperClasses}>
            <DocumentTextIcon className={`${inputIconClasses} !top-3.5`} /> {/* Ajuste para textarea */}
            <textarea
              name="bio"
              id="bio"
              rows={4}
              value={formData.bio || ''}
              onChange={handleInputChange}
              disabled={!isEditing || isSaving}
              className={`${inputBaseClasses} ${!isEditing || isSaving ? inputDisabledClasses : inputEnabledClasses} ${inputWithIconPadding} resize-y min-h-[100px]`}
              placeholder="Cuéntanos un poco sobre ti, tus intereses o lo que ofreces..."
            />
          </div>
        </div>
        
        {/* Botones de Acción */}
        <div className="border-t border-slate-200 dark:border-slate-700/50 pt-8 mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          {!isEditing ? (
            <button 
              type="button" 
              onClick={() => setIsEditing(true)} 
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-slate-800 hover:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all duration-150"
            >
               <PencilSquareIcon className="w-5 h-5" /> Editar Perfil
            </button>
          ) : (
            <>
              <button 
                type="button" 
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors duration-150 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-150 disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" /> Guardar Cambios
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </form>
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
          aria-invalid={error ? 'true' : 'false'}
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