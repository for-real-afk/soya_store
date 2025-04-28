/**
 * Google Translate Service
 * 
 * A service to interact with Google's Cloud Translation API.
 * You'll need to add your Google Cloud API key to use this service.
 */

const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '';
const API_ENDPOINT = 'https://translation.googleapis.com/language/translate/v2';

/**
 * Supported languages with their codes and display names
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'pt', name: 'Português' },
  { code: 'hi', name: 'हिन्दी' },
];

/**
 * Translate a single text string to the target language
 * 
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - The language code to translate to (e.g., 'es', 'fr')
 * @param {string} sourceLanguage - Optional source language code
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLanguage, sourceLanguage = '') => {
  if (!text || targetLanguage === 'en') {
    return text; // Return original text if empty or target is English
  }

  if (!API_KEY) {
    console.warn('Google Translate API key is not set. Using mock translation.');
    return `[${targetLanguage}] ${text}`; // Mock translation for development
  }

  try {
    // Prepare request parameters
    const params = new URLSearchParams({
      key: API_KEY,
      q: text,
      target: targetLanguage,
    });

    // Add source language if specified
    if (sourceLanguage) {
      params.append('source', sourceLanguage);
    }
    
    // Make API request
    const response = await fetch(`${API_ENDPOINT}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Translation request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the translated text from the response
    if (data?.data?.translations?.[0]?.translatedText) {
      return data.data.translations[0].translatedText;
    } else {
      throw new Error('Invalid response structure from translation API');
    }
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
};

/**
 * Batch translate multiple texts to the target language
 * 
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLanguage - The language code to translate to
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const batchTranslate = async (texts, targetLanguage) => {
  if (!texts || !texts.length || targetLanguage === 'en') {
    return texts; // Return original texts if empty or target is English
  }

  if (!API_KEY) {
    console.warn('Google Translate API key is not set. Using mock translations.');
    // Mock translations for development
    return texts.map(text => `[${targetLanguage}] ${text}`);
  }

  try {
    // Prepare request body
    const body = {
      q: texts,
      target: targetLanguage,
    };
    
    // Make API request
    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Batch translation request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the translated texts from the response
    if (data?.data?.translations) {
      return data.data.translations.map(t => t.translatedText);
    } else {
      throw new Error('Invalid response structure from translation API');
    }
  } catch (error) {
    console.error('Batch translation error:', error);
    // Return original texts if translation fails
    return texts;
  }
};

/**
 * Detect the language of a text
 * 
 * @param {string} text - The text to detect language for
 * @returns {Promise<string>} - Detected language code
 */
export const detectLanguage = async (text) => {
  if (!text || !API_KEY) {
    return 'en'; // Default to English if no text or API key
  }

  try {
    const params = new URLSearchParams({
      key: API_KEY,
      q: text,
    });
    
    const response = await fetch(`${API_ENDPOINT}/detect?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Language detection request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data?.data?.detections?.[0]?.[0]?.language) {
      return data.data.detections[0][0].language;
    } else {
      throw new Error('Invalid response structure from detection API');
    }
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English if detection fails
  }
};

export default {
  translateText,
  batchTranslate,
  detectLanguage,
  SUPPORTED_LANGUAGES,
};