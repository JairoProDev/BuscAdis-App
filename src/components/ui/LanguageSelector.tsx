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

export default function LanguageSelector({ 
  className = '', 
  variant = 'pill' 
}: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

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

  // Inicializar Google Translate de forma invisible
  useEffect(() => {
    const initializeGoogleTranslate = () => {
      // Evitar múltiples inicializaciones
      if (document.querySelector('#google-translate-script')) return;

      // Crear el script de Google Translate
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;

      // Función de inicialización global
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'es',
          includedLanguages: SUPPORTED_LANGUAGES.map(lang => lang.code).join(','),
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true,
        }, 'google_translate_element');

        // Ocultar la barra de Google Translate
        setTimeout(() => {
          const translateBar = document.querySelector('.goog-te-banner-frame');
          if (translateBar) {
            (translateBar as HTMLElement).style.display = 'none';
          }
          
          // Ocultar el elemento original también
          const translateElement = document.querySelector('#google_translate_element');
          if (translateElement) {
            (translateElement as HTMLElement).style.display = 'none';
          }

          // Restaurar el body top que Google Translate modifica
          document.body.style.top = '0px';
        }, 100);
      };

      document.head.appendChild(script);
    };

    // Inicializar después de un pequeño delay
    const timer = setTimeout(initializeGoogleTranslate, 500);
    return () => clearTimeout(timer);
  }, []);

  // Función para traducir instantáneamente
  const translatePage = (language: Language) => {
    setCurrentLanguage(language);
    setShowDropdown(false);
    
    if (language.code === 'es') {
      // Resetear a español original
      resetToOriginal();
      return;
    }

    setIsTranslating(true);

    // Buscar el selector de Google Translate
    const translateCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (translateCombo) {
      // Cambiar directamente el valor del selector
      translateCombo.value = language.code;
      
      // Disparar el evento de cambio
      const event = new Event('change', { bubbles: true });
      translateCombo.dispatchEvent(event);
      
      // Indicar que la traducción terminó después de un momento
      setTimeout(() => {
        setIsTranslating(false);
      }, 1000);
    } else {
      // Si no está listo, intentar después de un momento
      setTimeout(() => {
        const retryCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (retryCombo) {
          retryCombo.value = language.code;
          retryCombo.dispatchEvent(new Event('change', { bubbles: true }));
        }
        setIsTranslating(false);
      }, 1000);
    }
  };

  // Función para resetear al idioma original
  const resetToOriginal = () => {
    setIsTranslating(true);
    
    const translateCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (translateCombo) {
      translateCombo.value = '';
      translateCombo.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    setTimeout(() => {
      setIsTranslating(false);
    }, 500);
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
      {/* Google Translate Element (completamente oculto) */}
      <div 
        id="google_translate_element" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px', 
          visibility: 'hidden',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      ></div>
      
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isTranslating}
          className={`flex items-center gap-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${getVariantClasses()} ${
            isTranslating ? 'opacity-70 cursor-wait' : ''
          }`}
          aria-label="Seleccionar idioma"
          title={`Idioma actual: ${currentLanguage.nativeName}${isTranslating ? ' (Traduciendo...)' : ''}`}
        >
          {variant === 'minimal' ? (
            <GlobeAltIcon className={`w-5 h-5 text-slate-600 dark:text-slate-300 ${isTranslating ? 'animate-pulse' : ''}`} />
          ) : (
            <>
              <span className="text-lg" role="img" aria-label={currentLanguage.name}>
                {currentLanguage.flag}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
                {currentLanguage.code.toUpperCase()}
              </span>
              <ChevronDownIcon className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                showDropdown ? 'rotate-180' : ''
              } ${isTranslating ? 'animate-spin' : ''}`} />
            </>
          )}
        </button>

        {showDropdown && !isTranslating && (
          <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
            <div className="py-2">
              {/* Header */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Traducir página
                  </span>
                </div>
              </div>

              {/* Lista de idiomas */}
              <div className="max-h-64 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => translatePage(language)}
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
                        {language.code === 'es' && ' (Original)'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {language.code === 'es' ? 'Idioma nativo del sitio' : `Traducir a ${language.name}`}
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
                  <span>Traducción instantánea automática</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Indicador de traducción */}
        {isTranslating && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-teal-500 text-white text-xs rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Traduciendo a {currentLanguage.nativeName}...</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 