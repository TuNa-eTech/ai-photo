import React from 'react';
import { useTranslation } from 'react-i18next';

export default function FinalCTA() {
  const { t } = useTranslation();
  const appUrl = import.meta.env.VITE_APP_STORE_URL || 'https://apps.apple.com/app/id1234567890';
  return (
    <section className="text-center space-y-4">
      <h2 className="text-3xl font-display">Ready to create?</h2>
      <a href={appUrl} className="inline-block px-6 py-3 rounded bg-brand-emphasis text-white hover:opacity-90">
        {t('cta.download')}
      </a>
    </section>
  );
}
