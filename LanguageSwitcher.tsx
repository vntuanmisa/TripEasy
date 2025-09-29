
import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useContext(LanguageContext);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'vi' : 'en');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="bg-white bg-opacity-20 text-white font-semibold py-2 px-4 rounded-full hover:bg-opacity-30 transition-colors"
            aria-label="Change language"
        >
            {language === 'en' ? 'VIE' : 'ENG'}
        </button>
    );
};

export default LanguageSwitcher;
