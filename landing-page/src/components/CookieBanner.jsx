import React from 'react';
import useCookieConsent from '../hooks/useCookieConsent.js';
import { initGA } from '../utils/gtag.js';
import { useTranslation } from 'react-i18next';

export default function CookieBanner() {
  const { t } = useTranslation();
  const { consent, accept, reject } = useCookieConsent();
  React.useEffect(() => {
    if (consent === 'accepted') {
      const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
      if (id) initGA(id);
    }
  }, [consent]);
  if (consent !== 'unknown') return null;
  return (
    <div className="fixed bottom-4 inset-x-4 z-50 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg border p-4">
      <p className="text-sm font-medium">{t('cookie.title')}</p>
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-1 bg-brand-emphasis text-white rounded" onClick={accept}>{t('cookie.accept')}</button>
        <button className="px-3 py-1 border rounded" onClick={reject}>{t('cookie.reject')}</button>
      </div>
    </div>
  );
}
