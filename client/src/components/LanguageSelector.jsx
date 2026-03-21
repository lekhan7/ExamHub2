import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' }
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Set initial font class on mount
  useEffect(() => {
    const body = document.body;
    const fontMap = {
      'ta': 'font-tamil',
      'te': 'font-telugu',
      'kn': 'font-kannada',
      'ml': 'font-malayalam',
      'hi': 'font-devanagari',
      'mr': 'font-devanagari',
      'bn': 'font-bengali',
      'gu': 'font-gujarati',
      'pa': 'font-gurmukhi',
      'or': 'font-oriya',
      'en': 'font-latin'
    };
    
    body.classList.add(fontMap[i18n.language] || 'font-latin');
  }, [i18n.language]);

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    
    // Update font class on body based on language
    const body = document.body;
    body.className = body.className.replace(/font-\w+/g, '');
    
    const fontMap = {
      'ta': 'font-tamil',
      'te': 'font-telugu',
      'kn': 'font-kannada',
      'ml': 'font-malayalam',
      'hi': 'font-devanagari',
      'mr': 'font-devanagari',
      'bn': 'font-bengali',
      'gu': 'font-gujarati',
      'pa': 'font-gurmukhi',
      'or': 'font-oriya',
      'en': 'font-latin'
    };
    
    body.classList.add(fontMap[languageCode] || 'font-latin');
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-secondary border border-border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    i18n.language === language.code
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary/80'
                  }`}
                >
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-sm opacity-70">{language.name}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
