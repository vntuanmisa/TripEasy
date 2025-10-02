'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { isOnline } from '@/lib/utils';

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const t = useTranslations('offline');

  useEffect(() => {
    setOnline(isOnline());

    const handleOnline = () => {
      setOnline(true);
      setShowOfflineIndicator(false);
    };

    const handleOffline = () => {
      setOnline(false);
      setShowOfflineIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide offline indicator after 5 seconds when back online
  useEffect(() => {
    if (online && showOfflineIndicator) {
      const timer = setTimeout(() => {
        setShowOfflineIndicator(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [online, showOfflineIndicator]);

  return (
    <>
      {showOfflineIndicator && !online && (
        <div className={`offline-indicator ${showOfflineIndicator ? 'show' : ''}`}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{t('message')}</span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
