
import React, { createContext, useState, useCallback } from 'react';
import { translations } from './translations';
import { useLocalStorage } from './hooks/useLocalStorage';

type Language = 'en' | 'vi';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
    language: 'vi',
    setLanguage: () => {},
    t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useLocalStorage<Language>('language', 'vi');

    const t = useCallback((key: string, options: Record<string, string | number> = {}) => {
        let translation = translations[language][key] || translations['en'][key] || key;
        Object.keys(options).forEach(optionKey => {
            translation = translation.replace(`{{${optionKey}}}`, String(options[optionKey]));
        });
        return translation;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
