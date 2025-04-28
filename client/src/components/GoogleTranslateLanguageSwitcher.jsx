import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';

/**
 * GoogleTranslateLanguageSwitcher component
 * 
 * A dropdown component that allows users to switch between supported languages
 * using Google Translate API.
 */
const GoogleTranslateLanguageSwitcher = () => {
  const { 
    language, 
    changeLanguage, 
    supportedLanguages, 
    isTranslating,
    currentLanguageName 
  } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  
  // Flag icons for common languages
  const getFlagEmoji = (langCode) => {
    const flags = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'ar': '🇸🇦',
      'hi': '🇮🇳',
    };
    
    return flags[langCode] || '';
  };
  
  // Handle language selection
  const handleSelectLanguage = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center space-x-1 px-2 text-dark hover:text-primary hover:bg-transparent"
          >
            {isTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Globe className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm">{
              language === 'en' 
                ? 'EN' 
                : language.toUpperCase()
            }</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <div className="p-1 max-h-[300px] overflow-y-auto">
            {supportedLanguages.map((lang) => (
              <Button
                key={lang.code}
                variant="ghost"
                className={`flex justify-start items-center w-full px-2 py-1.5 text-sm ${
                  language === lang.code ? 'bg-muted font-medium' : ''
                }`}
                onClick={() => handleSelectLanguage(lang.code)}
              >
                <span className="mr-2 text-base">{getFlagEmoji(lang.code)}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-primary text-xs">✓</span>
                )}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Translation in progress indicator */}
      {isTranslating && (
        <div className="fixed bottom-4 right-4 bg-primary text-white text-sm px-3 py-2 rounded-md shadow-md flex items-center z-50">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Translating...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslateLanguageSwitcher;