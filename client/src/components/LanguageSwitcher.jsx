import React from 'react';
import { Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

/**
 * LanguageSwitcher component (Compatibility wrapper)
 * 
 * This component is a compatibility wrapper that uses the GoogleTranslate functionality
 * through the LanguageContext.
 */
const LanguageSwitcher = () => {
  const { language, changeLanguage, supportedLanguages } = useLanguage();
  
  // Get current language display
  const currentLang = supportedLanguages.find(lang => lang.code === language);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-1 px-2 text-dark hover:text-primary hover:bg-transparent"
        >
          <Globe className="h-4 w-4 mr-1" />
          <span className="text-sm">{language.toUpperCase()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-0">
        <div className="p-1">
          {supportedLanguages.map((lang) => (
            <Button
              key={lang.code}
              variant="ghost"
              className={`flex justify-start items-center w-full px-2 py-1.5 text-sm ${
                language === lang.code ? 'bg-muted font-medium' : ''
              }`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span>{lang.name}</span>
              {language === lang.code && (
                <span className="ml-auto text-primary text-xs">✓</span>
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;