import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();
  const beforeUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=80';
  const afterUrl  = 'https://images.unsplash.com/photo-1519400197429-404ae1a1e184?auto=format&fit=crop&w=1600&q=80';
  const appUrl = import.meta.env.VITE_APP_STORE_URL || 'https://apps.apple.com/app/id1234567890';

  return (
    <section aria-labelledby="hero-heading" className="grid md:grid-cols-2 gap-10 items-center">
      <div className="space-y-6">
        <h1 id="hero-heading" className="text-4xl md:text-5xl font-display leading-tight">{t('hero.title')}</h1>
        <p className="text-lg text-black/80">{t('hero.subtitle')}</p>
        <div className="flex gap-3">
          <a href={appUrl} className="px-5 py-3 rounded bg-brand-emphasis text-white hover:opacity-90">
            {t('cta.download')}
          </a>
          <a href="#pricing" className="px-5 py-3 rounded border hover:bg-black/5">
            {t('cta.startFree')}
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <figure className="overflow-hidden rounded-lg shadow">
          <img src={beforeUrl} alt="Original portrait" loading="eager" fetchpriority="high" decoding="async" className="w-full h-full object-cover" />
          <figcaption className="sr-only">Before</figcaption>
        </figure>
        <figure className="overflow-hidden rounded-lg shadow">
          <img src={afterUrl} alt="Cinematic styled portrait" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          <figcaption className="sr-only">After</figcaption>
        </figure>
      </div>
    </section>
  );
}
