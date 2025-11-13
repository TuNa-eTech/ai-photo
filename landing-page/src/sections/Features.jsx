import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Features() {
  const { t } = useTranslation();
  const items = t('features.items', { returnObjects: true });
  return (
    <section id="features" aria-labelledby="features-heading" className="space-y-8">
      <h2 id="features-heading" className="text-3xl font-display">{t('features.title')}</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <article key={i} className="p-6 rounded-lg border bg-white/60 backdrop-blur dark:bg-slate-900/40">
            <h3 className="font-semibold mb-2">{it.title}</h3>
            <p className="text-sm opacity-80">{it.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
