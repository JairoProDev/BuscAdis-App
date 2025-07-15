'use client';

import { useState, useEffect, useRef } from 'react';
import { GlobeAltIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';

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

interface LanguageSelectorMenuItemProps {
  menuItemClasses: string;
  menuItemIconClasses: string;
  onClose: () => void;
}

export default function LanguageSelectorMenuItem({ 
  menuItemClasses, 
  menuItemIconClasses,
  onClose 
}: LanguageSelectorMenuItemProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, right: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('lang', 'es');
  }, []);

  // Calculate submenu position when it opens
  useEffect(() => {
    if (showLanguageSubmenu && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      
      // Position to the left of the button
      setSubmenuPosition({
        top: buttonRect.top,
        right: window.innerWidth - buttonRect.left + 8 // 8px de margen
      });
    }
  }, [showLanguageSubmenu]);

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowLanguageSubmenu(false);
      }
    };

    if (showLanguageSubmenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguageSubmenu]);

  const getTextNodes = (element: Element): Text[] => {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          const skipTags = ['script', 'style', 'code', 'pre'];
          const skipClasses = ['notranslate'];
          
          if (skipTags.includes(tagName)) return NodeFilter.FILTER_REJECT;
          if (skipClasses.some(cls => parent.classList.contains(cls))) return NodeFilter.FILTER_REJECT;
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }
    
    return textNodes;
  };

  const translateWithGoogleAPI = async (targetLang: string) => {
    try {
      const textNodes = getTextNodes(document.body);
      
      for (const node of textNodes) {
        if (node.textContent && node.textContent.trim().length > 2) {
          try {
            const text = encodeURIComponent(node.textContent.trim());
            const response = await fetch(
              `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${targetLang}&dt=t&q=${text}`,
              {
                method: 'GET',
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const translatedText = data[0]?.[0]?.[0];
              
              if (translatedText && translatedText !== node.textContent.trim()) {
                node.textContent = translatedText;
              }
            }
          } catch (error) {
            // Error silencioso para evitar spam en consola
          }
          
          // Delay para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const translatePage = async (language: Language) => {
    setCurrentLanguage(language);
    setShowLanguageSubmenu(false);
    setIsTranslating(true);
    onClose();

    if (language.code === 'es') {
      document.documentElement.setAttribute('lang', 'es');
      document.documentElement.removeAttribute('data-translate-lang');
      setIsTranslating(false);
      return;
    }

    try {
      const success = await translateWithGoogleAPI(language.code);
      
      if (success) {
        document.documentElement.setAttribute('data-translate-lang', language.code);
        document.documentElement.setAttribute('lang', language.code);
      }
      
    } catch (error) {
      console.error('Error durante la traducción:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        role="menuitem"
        className={`${menuItemClasses} w-full ${isTranslating ? 'opacity-70 cursor-wait' : ''}`}
        onClick={() => setShowLanguageSubmenu(!showLanguageSubmenu)}
        onMouseEnter={() => setShowLanguageSubmenu(true)}
        disabled={isTranslating}
      >
        <div className="flex items-center gap-3 w-full">
          <GlobeAltIcon className={menuItemIconClasses} />
          <div className="flex-1 flex items-center justify-between">
            <span>Idioma</span>
            <div className="flex items-center gap-2">
              <span className="text-xs" role="img" aria-label={currentLanguage.name}>
                {currentLanguage.flag}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {currentLanguage.code.toUpperCase()}
              </span>
              <ChevronRightIcon className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                showLanguageSubmenu ? 'rotate-90' : ''
              } ${isTranslating ? 'animate-spin' : ''}`} />
            </div>
          </div>
        </div>
      </button>

      {/* Portal para el submenú de idiomas */}
      {showLanguageSubmenu && !isTranslating && typeof window !== 'undefined' && (
        <div 
          ref={submenuRef}
          className="fixed w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[9999]"
          style={{
            top: `${submenuPosition.top}px`,
            right: `${submenuPosition.right}px`
          }}
        >
          <div className="py-1">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <GlobeAltIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Traductor de Página
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full" title="Sistema de traducción activo"></div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => translatePage(language)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    currentLanguage.code === language.code ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                  }`}
                >
                  <span className="text-base" role="img" aria-label={language.name}>
                    {language.flag}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {language.nativeName}
                      {language.code === 'es' && ' (Original)'}
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
          </div>
        </div>
      )}

      {/* Indicador de traducción */}
      {isTranslating && typeof window !== 'undefined' && (
        <div 
          className="fixed w-56 p-3 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 text-white text-sm rounded-lg shadow-lg z-[9999]"
          style={{
            top: `${submenuPosition.top}px`,
            right: `${submenuPosition.right}px`
          }}
        >
          <div className="flex items-center gap-2 justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Traduciendo a {currentLanguage.nativeName}...</span>
          </div>
        </div>
      )}
    </div>
  );
} 