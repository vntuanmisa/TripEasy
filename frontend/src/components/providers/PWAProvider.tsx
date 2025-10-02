'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const t = useTranslations('pwa');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install banner after 30 seconds if not already installed
      setTimeout(() => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          setShowInstallBanner(true);
        }
      }, 30000);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if user previously dismissed the banner
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (dismissedTime > sevenDaysAgo) {
        setShowInstallBanner(false);
      }
    }
  }, []);

  return (
    <>
      {children}
      {showInstallBanner && deferredPrompt && (
        <div className={`pwa-install-banner ${showInstallBanner ? 'show' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{t('installPrompt')}</h3>
              <p className="text-xs opacity-90 mt-1">{t('installDesc')}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleDismiss}
                className="px-3 py-1 text-xs bg-white/20 rounded hover:bg-white/30 transition-colors"
              >
                {t('dismiss')}
              </button>
              <button
                onClick={handleInstallClick}
                className="px-3 py-1 text-xs bg-white text-blue-600 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                {t('install')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
