'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileService } from '@/services/profile.service';
import { BuscadisAvatarIcon } from '@/components/icons/BuscadisAvatarIcon';
import { useAchievements } from '@/services/achievements.service';
import { safeLocalStorageSet } from '@/utils/safeJSON';

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// NOTE: For PDF/QR functionality, ensure 'html2canvas' and 'jspdf' are installed.
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  points?: number;
  badges?: string[];
  progress?: number;
  verified?: boolean;
  activity?: unknown[];
  privacySettings?: Record<string, 'public' | 'private' | 'admin'>;
}

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

  // Estado para feedback visual
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // 4. Add useAchievements hook for gamification
  const achievementsStore = useAchievements();

  // Add state for wizard modal
  const [wizardOpen, setWizardOpen] = useState(false);

  // --- Recommendations Wall State ---
  const [endorsements, setEndorsements] = useState<{ name: string; message: string }[]>([]);
  const [newEndorsement, setNewEndorsement] = useState({ name: '', message: '' });

  // --- Portfolio & Verification Upload State ---
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [verificationFiles, setVerificationFiles] = useState<File[]>([]);

  // --- Contact Preferences & Privacy State ---
  const [contactPrefs, setContactPrefs] = useState({ whatsapp: true, email: true, phone: false });
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'admin'>('public');

  // --- Profile Sharing (QR, PDF, Social) ---
  const handleDownloadProfile = async () => {
    const card = document.getElementById('profile-card');
    if (!card) return;
    const canvas = await html2canvas(card);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(imgData, 'PNG', 10, 10, 180, 120);
    pdf.save('ID-buscadis.pdf');
  };
  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';

  // --- Dashboard Stats Placeholder ---
  const dashboardStats = {
    searches: 12,
    favorites: 5,
    posts: 3,
    recommendations: endorsements.length,
  };

  // Efecto para cargar datos del perfil
  useEffect(() => {
    if (authIsLoading) {
      setPageLoading(true);
      return;
    }
    if (!isAuthenticated || !user?.id) {
      setPageLoading(false);
      setFormData(normalizeAuthUserToProfile(null));
      return;
    }
    const fetchProfile = async () => {
      setPageLoading(true);
      try {
        const profileDataFromService = await ProfileService.getProfile();
        if (profileDataFromService && Object.keys(profileDataFromService).length > 0) {
          setFormData(profileDataFromService);
          initialFormDataRef.current = { ...profileDataFromService };
        } else {
          // Si no hay perfil, inicializa con datos mínimos del usuario
          const baseAuthData = normalizeAuthUserToProfile(user);
          setFormData(baseAuthData);
          initialFormDataRef.current = { ...baseAuthData };
        }
      } catch {
        const fallbackData = normalizeAuthUserToProfile(user);
        setFormData(fallbackData);
        initialFormDataRef.current = { ...fallbackData };
      } finally {
        setPageLoading(false);
      }
    };
    fetchProfile();
  }, [authIsLoading, isAuthenticated, user]);

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

  // Guardar perfil
  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    setSaveMessage('');
    try {
      const updatedProfile = await ProfileService.createOrUpdateProfile({
        ...formData,
        interests,
        socialLinks,
        points: 100, // Ejemplo: calcular puntos reales
        badges: [], // Ejemplo: calcular badges reales
        progress: profileProgress, // Ejemplo: calcular progreso real
      });
      setFormData(updatedProfile);
      setIsEditing(false);
      setSaveStatus('success');
      setSaveMessage('¡Perfil guardado exitosamente!');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setSaveMessage('Error al guardar el perfil. Intenta de nuevo.');
      setTimeout(() => setSaveStatus('idle'), 3500);
    }
  };

  // Fix useEffect for progress calculation to avoid infinite loop
  useEffect(() => {
    let filled = 0;
    const total = 8; // fullName, phone, email, bio, avatar, occupation, gender, birthdate
    if (formData.fullName) filled++;
    if (formData.phone) filled++;
    if (formData.email) filled++;
    if (formData.bio) filled++;
    if (formData.avatarUrl) filled++;
    if (formData.occupation) filled++;
    if (formData.gender) filled++;
    if (formData.birthdate) filled++;
    if (interests.length) filled++;
    if (socialLinks.length) filled++;
    if (formData.verified) filled++;
    if (formData.badges && formData.badges.length) filled++;
    const progress = Math.min(Math.round((filled / (total + 4)) * 100), 100);
    // Only update if progress actually changed
    if (formData.progress !== progress) {
      setFormData(prev => ({ ...prev, progress }));
    }
    // Only update badges if needed
    if (
      progress === 100 &&
      (!formData.badges || !formData.badges.includes('perfil_100'))
    ) {
      achievementsStore.unlockAchievement('all_fields');
      setFormData(prev => ({ ...prev, badges: [...(prev.badges || []), 'perfil_100'] }));
      setTimeout(() => setSaveStatus('success'), 4000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.fullName, formData.phone, formData.email, formData.bio, formData.avatarUrl, formData.occupation, formData.gender, formData.birthdate, interests, socialLinks, formData.verified, formData.badges, achievementsStore]);

  // 6. Points system: update points on actions, sync to localStorage, and backend on logout
  useEffect(() => {
    const points = achievementsStore.totalPoints + (formData.progress || 0);
    setFormData(prev => ({ ...prev, points }));
    safeLocalStorageSet('profile_points', points);
  }, [achievementsStore.totalPoints, formData.progress]);

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
      {/* Barra de progreso arriba */}
      <div className="w-full flex items-center mb-6">
        <div className="flex-1">
          <div className="h-3 rounded-full bg-slate-700/40 overflow-hidden">
            <div className="h-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500" style={{ width: `${profileProgress}%` }} />
          </div>
          <div className="text-xs text-slate-400 mt-1">Progreso de tu ID BuscAdis: {profileProgress}%</div>
        </div>
        {/* Puntos acumulados */}
        <div className="ml-6 flex items-center gap-2">
          <span className="text-lg font-bold text-teal-400">{formData.points || 0} pts</span>
          <span className="text-xs text-slate-400">Puntos</span>
        </div>
      </div>
      {/* Cabecera: avatar a la izquierda, nombre y badges a la derecha */}
      <div className="flex items-center gap-8 mb-8">
        <div className="relative group">
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-50 mb-1">{formData.fullName || 'Tu Nombre'}</h1>
          <div className="flex items-center gap-2 mb-2">
            {/* Aquí puedes mapear badges/logros */}
            {/* <BadgeIcon /> */}
          </div>
          <p className="text-slate-400 text-base">¡Estás creando tu ID BuscAdis! Entre más completo tu perfil, mejores resultados tendrás.</p>
        </div>
      </div>
      {/* Sección de intereses */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-teal-400 flex items-center gap-2">
            <UserIcon className="w-5 h-5" /> ¿Qué estás buscando?
          </h2>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold shadow hover:from-teal-600 hover:to-cyan-600 transition-all"
            onClick={() => setWizardOpen(true)}
          >
            Asistente
          </button>
        </div>
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
        {/* Interest Wizard Modal */}
        <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personaliza tu experiencia</DialogTitle>
              <DialogDescription>
                Selecciona tus intereses principales. Puedes elegir más de uno. (Próximamente: subniveles y preguntas guiadas)
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-3 my-4">
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
            <DialogFooter>
              <button
                type="button"
                className="w-full px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow hover:from-teal-600 hover:to-cyan-600 transition-all"
                onClick={() => setWizardOpen(false)}
              >
                Guardar intereses
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      {/* Sección de datos personales y contacto */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2"><IdentificationIcon className="w-5 h-5" /> Datos personales</h2>
        {/* Nombre, sexo (select), fecha de nacimiento, ocupación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField label="Nombre Completo" id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} placeholder="Ej: Jairo S. Quiñones" disabled={!isEditing || isSaving} icon={IdentificationIcon} />
          <FormField label="Ocupación" id="occupation" name="occupation" type="text" value={formData.occupation || ''} onChange={handleInputChange} placeholder="Ej: Desarrollador, Estudiante..." disabled={!isEditing || isSaving} icon={BriefcaseIcon} />
          {/* Sexo como select */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sexo</label>
            <div className="relative">
              <select
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                disabled={!isEditing || isSaving}
                className="block w-full text-base rounded-lg border bg-white dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/40 transition-colors duration-150"
              >
                <option value="">Selecciona...</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="no-decir">Prefiero no decirlo</option>
              </select>
            </div>
          </div>
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
      {/* Dashboard & Stats */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2">
          <span className="inline-block w-5 h-5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mr-2" />
          Tu Actividad y Estadísticas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-teal-400">{dashboardStats.searches}</div>
            <div className="text-xs text-slate-400">Búsquedas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-400">{dashboardStats.favorites}</div>
            <div className="text-xs text-slate-400">Favoritos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-400">{dashboardStats.posts}</div>
            <div className="text-xs text-slate-400">Publicaciones</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-400">{dashboardStats.recommendations}</div>
            <div className="text-xs text-slate-400">Recomendaciones</div>
          </div>
        </div>
      </section>
      {/* Recommendations Wall */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2">
          <span className="inline-block w-5 h-5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mr-2" />
          Muro de Recomendaciones
        </h2>
        <div className="space-y-3 mb-4">
          {endorsements.length === 0 && <div className="text-slate-400 text-sm">Aún no tienes recomendaciones. ¡Pide a tus contactos que te recomienden!</div>}
          {endorsements.map((e, i) => (
            <div key={i} className="bg-slate-800/60 rounded-lg p-3 shadow flex flex-col">
              <span className="font-semibold text-teal-300">{e.name}</span>
              <span className="text-slate-200 text-sm mt-1">{e.message}</span>
            </div>
          ))}
        </div>
        <form
          className="flex flex-col gap-2 md:flex-row md:items-end"
          onSubmit={e => {
            e.preventDefault();
            if (newEndorsement.name && newEndorsement.message) {
              setEndorsements(prev => [...prev, newEndorsement]);
              setNewEndorsement({ name: '', message: '' });
            }
          }}
        >
          <input
            type="text"
            placeholder="Tu nombre"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white/80"
            value={newEndorsement.name}
            onChange={e => setNewEndorsement(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Tu recomendación o mensaje"
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white/80"
            value={newEndorsement.message}
            onChange={e => setNewEndorsement(prev => ({ ...prev, message: e.target.value }))}
            required
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow hover:from-teal-600 hover:to-cyan-600 transition-all">Agregar</button>
        </form>
      </section>
      {/* Portfolio & Verification Uploaders */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2">
          <span className="inline-block w-5 h-5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mr-2" />
          Portafolio y Verificación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Sube tu portafolio (PDF, imágenes, etc.)</label>
            <input type="file" multiple accept=".pdf,image/*" onChange={e => setPortfolioFiles(Array.from(e.target.files || []))} className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" title="Sube tu portafolio" placeholder="Selecciona archivos de portafolio" />
            {portfolioFiles.length > 0 && <div className="mt-2 text-xs text-slate-400">{portfolioFiles.length} archivo(s) seleccionado(s)</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Documentos de verificación (DNI, certificados, etc.)</label>
            <input type="file" multiple accept=".pdf,image/*" onChange={e => setVerificationFiles(Array.from(e.target.files || []))} className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" title="Sube documentos de verificación" placeholder="Selecciona archivos de verificación" />
            {verificationFiles.length > 0 && <div className="mt-2 text-xs text-slate-400">{verificationFiles.length} archivo(s) seleccionado(s)</div>}
          </div>
        </div>
      </section>
      {/* Contact Preferences & Privacy Controls */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-teal-400 mb-3 flex items-center gap-2">
          <span className="inline-block w-5 h-5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mr-2" />
          Preferencias de Contacto y Privacidad
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-2 text-slate-300 font-medium">¿Cómo prefieres ser contactado?</div>
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" checked={contactPrefs.whatsapp} onChange={e => setContactPrefs(p => ({ ...p, whatsapp: e.target.checked }))} title="Permitir contacto por WhatsApp" placeholder="WhatsApp" /> WhatsApp
            </label>
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" checked={contactPrefs.email} onChange={e => setContactPrefs(p => ({ ...p, email: e.target.checked }))} title="Permitir contacto por Email" placeholder="Email" /> Email
            </label>
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" checked={contactPrefs.phone} onChange={e => setContactPrefs(p => ({ ...p, phone: e.target.checked }))} title="Permitir contacto por Teléfono" placeholder="Teléfono" /> Teléfono
            </label>
          </div>
          <div className="flex-1">
            <div className="mb-2 text-slate-300 font-medium">Privacidad de tu perfil</div>
            <select
              value={privacy}
              onChange={e => setPrivacy(e.target.value as 'public' | 'private' | 'admin')}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white/80"
              aria-label="Privacidad de tu perfil"
              title="Privacidad de tu perfil"
            >
              <option value="public">Público (visible para todos)</option>
              <option value="private">Privado (solo tú)</option>
              <option value="admin">Solo administradores</option>
            </select>
          </div>
        </div>
      </section>
      {/* Profile Sharing (QR, PDF, Social) */}
      <section className="mb-8 bg-white/5 rounded-xl p-6 shadow-lg flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex-1 flex flex-col items-center gap-3">
          <h2 className="text-lg font-semibold text-teal-400 mb-1 flex items-center gap-2">
            <span className="inline-block w-5 h-5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mr-2" />
            Comparte tu ID
          </h2>
          {/* TODO: Instalar e importar un componente QRCode, por ahora placeholder */}
          <div className="bg-white p-2 rounded-lg shadow text-center text-slate-500">[QR Code aquí]</div>
          <div className="flex gap-2 mt-2">
            <button onClick={handleDownloadProfile} className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow hover:from-teal-600 hover:to-cyan-600 transition-all">Descargar PDF</button>
            <a href={`https://wa.me/?text=Mira%20mi%20perfil%20en%20BuscAdis:%20${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition-all">WhatsApp</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all">Facebook</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition-all">LinkedIn</a>
          </div>
        </div>
      </section>
      {/* Botones de acción */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
        {!isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-slate-800 hover:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all duration-150">
            <PencilSquareIcon className="w-5 h-5" /> Editar Perfil
          </button>
        ) : (
          <>
            <button type="button" onClick={handleCancelEdit} disabled={isSaving} className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors duration-150 disabled:opacity-60">Cancelar</button>
            <button type="button" onClick={handleSaveProfile} disabled={saveStatus === 'saving'} className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-150 disabled:opacity-70">
              {saveStatus === 'saving' ? (<><ArrowPathIcon className="w-5 h-5 animate-spin" /> Guardando...</>) : (<><CheckCircleIcon className="w-5 h-5" /> Guardar Cambios</>)}
            </button>
          </>
        )}
      </div>
      {/* Toast de feedback visual */}
      {saveStatus === 'success' && (
        <div className="fixed top-20 right-5 z-[10000] bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-slide-in-from-right">
          {saveMessage}
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="fixed top-20 right-5 z-[10000] bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-slide-in-from-right">
          {saveMessage}
        </div>
      )}
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