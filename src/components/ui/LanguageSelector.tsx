'use client';

import { useState, useEffect } from 'react';
import { GlobeAltIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

interface LanguageSelectorProps {
  className?: string;
  variant?: 'pill' | 'button' | 'minimal';
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate: {
        TranslateElement: any;
      };
    };
  }
}

export default function LanguageSelector({ 
  className = '', 
  variant = 'pill' 
}: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGoogleTranslateLoaded, setIsGoogleTranslateLoaded] = useState(false);

  // Detectar idioma del navegador al cargar
  useEffect(() => {
    const detectBrowserLanguage = () => {
      const browserLang = navigator.language.split('-')[0];
      const detectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
      if (detectedLang) {
        setCurrentLanguage(detectedLang);
      }
    };

    detectBrowserLanguage();
  }, []);

  // Cargar Google Translate automáticamente si no está cargado
  useEffect(() => {
    const loadGoogleTranslate = () => {
      // Verificar si ya está cargado
      if (window.google?.translate) {
        setIsGoogleTranslateLoaded(true);
        return;
      }

      // Crear script solo si no existe
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        
        // Función callback global
        window.googleTranslateElementInit = () => {
          if (window.google?.translate?.TranslateElement) {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'es',
                includedLanguages: SUPPORTED_LANGUAGES.map(lang => lang.code).join(','),
                layout: 0, // SIMPLE layout
                autoDisplay: false,
              },
              'google_translate_element'
            );
            setIsGoogleTranslateLoaded(true);
          }
        };

        document.head.appendChild(script);
      }
    };

    // Cargar después de un pequeño delay para no bloquear la carga inicial
    const timer = setTimeout(loadGoogleTranslate, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Función para cambiar idioma usando Google Translate
  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    setShowDropdown(false);

    // Método 1: Usar Google Translate si está disponible
    if (isGoogleTranslateLoaded && window.google?.translate) {
      // Disparar evento de cambio de idioma en Google Translate
      const translateElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (translateElement) {
        translateElement.value = language.code;
        translateElement.dispatchEvent(new Event('change'));
        return;
      }
    }

    // Método 2: Fallback - abrir Google Translate en nueva pestaña
    const currentUrl = window.location.href;
    const translateUrl = `https://translate.google.com/translate?sl=es&tl=${language.code}&u=${encodeURIComponent(currentUrl)}`;
    
    // Preguntar al usuario si quiere traducir en nueva pestaña
    if (window.confirm(`¿Traducir la página a ${language.nativeName}? Se abrirá en una nueva pestaña.`)) {
      window.open(translateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Función para resetear a idioma original
  const resetToOriginal = () => {
    if (isGoogleTranslateLoaded) {
      const translateElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (translateElement) {
        translateElement.value = '';
        translateElement.dispatchEvent(new Event('change'));
      }
    } else {
      // Recargar página para volver al idioma original
      window.location.reload();
    }
    setCurrentLanguage(SUPPORTED_LANGUAGES[0]);
    setShowDropdown(false);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'button':
        return 'px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50';
      case 'minimal':
        return 'p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg';
      case 'pill':
      default:
        return 'px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-teal-400 dark:hover:border-teal-500';
    }
  };

  return (
    <>
      {/* Google Translate Element (oculto) */}
      <div id="google_translate_element" className="hidden"></div>
      
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center gap-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${getVariantClasses()}`}
          aria-label="Seleccionar idioma"
          title={`Idioma actual: ${currentLanguage.nativeName}`}
        >
          {variant === 'minimal' ? (
            <GlobeAltIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <>
              <span className="text-lg" role="img" aria-label={currentLanguage.name}>
                {currentLanguage.flag}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
                {currentLanguage.code.toUpperCase()}
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
            <div className="py-2">
              {/* Header */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Seleccionar idioma
                  </span>
                </div>
              </div>

              {/* Opción para idioma original */}
              <button
                onClick={resetToOriginal}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  currentLanguage.code === 'es' ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                }`}
              >
                <span className="text-lg">🇪🇸</span>
                <div className="flex-1">
                  <div className="font-medium text-slate-800 dark:text-slate-100">
                    Español (Original)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Idioma nativo del sitio
                  </div>
                </div>
                {currentLanguage.code === 'es' && (
                  <CheckIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
              </button>

              {/* Separador */}
              <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>

              {/* Lista de idiomas */}
              <div className="max-h-64 overflow-y-auto">
                {SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'es').map((language) => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      currentLanguage.code === language.code ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                    }`}
                  >
                    <span className="text-lg" role="img" aria-label={language.name}>
                      {language.flag}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {language.nativeName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {language.name}
                      </div>
                    </div>
                    {currentLanguage.code === language.code && (
                      <CheckIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer con info */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-2 px-4 pb-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <GlobeAltIcon className="w-3 h-3" />
                  <span>Traducción automática</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 