import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, translateText, batchTranslate } from '@/lib/googleTranslateService';

// Create the language context
const LanguageContext = createContext();

// Cached translations to avoid repeated API calls
const translationCache = {};

export function LanguageProvider({ children }) {
  // Current language state - default to English
  const [language, setLanguage] = useState(() => {
    // Try to get saved language from localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage');
    return savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)
      ? savedLanguage
      : 'en';
  });

  // Loading state for translations
  const [isTranslating, setIsTranslating] = useState(false);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // Function to change the current language
  const changeLanguage = useCallback((langCode) => {
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === langCode)) {
      setLanguage(langCode);
    } else {
      console.warn(`Language code "${langCode}" is not supported.`);
    }
  }, []);

  // Function to translate text using Google Translate
  const t = useCallback(async (key, defaultText) => {
    // If language is English or no text, return as is
    if (language === 'en' || !defaultText) {
      return defaultText || key;
    }

    const text = defaultText || key;
    const cacheKey = `${language}:${text}`;
    
    // Check if we already have this translation cached
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    try {
      setIsTranslating(true);
      const translated = await translateText(text, language);
      
      // Cache the result
      translationCache[cacheKey] = translated;
      
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  // Batch translate multiple texts at once
  const batchT = useCallback(async (texts) => {
    if (language === 'en' || !texts || !texts.length) {
      return texts;
    }

    // Check which texts need translation (not in cache)
    const textsToTranslate = [];
    const cachedResults = [];
    const indices = [];

    texts.forEach((text, i) => {
      const cacheKey = `${language}:${text}`;
      if (translationCache[cacheKey]) {
        cachedResults[i] = translationCache[cacheKey];
      } else {
        textsToTranslate.push(text);
        indices.push(i);
      }
    });

    // If all texts are cached, return the cached results
    if (textsToTranslate.length === 0) {
      return texts.map((_, i) => cachedResults[i] || texts[i]);
    }

    try {
      setIsTranslating(true);
      const translatedTexts = await batchTranslate(textsToTranslate, language);
      
      // Cache the results
      translatedTexts.forEach((translated, i) => {
        const originalText = textsToTranslate[i];
        translationCache[`${language}:${originalText}`] = translated;
        
        const originalIndex = indices[i];
        cachedResults[originalIndex] = translated;
      });
      
      // Combine cached and new translations
      return texts.map((text, i) => cachedResults[i] || text);
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts; // Return original texts if translation fails
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  // Get the current language display name
  const currentLanguageName = SUPPORTED_LANGUAGES.find(lang => lang.code === language)?.name || 'English';

  // Context value
  const value = {
    language,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isTranslating,
    t,
    batchT,
    currentLanguageName
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;