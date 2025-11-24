import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Testimonials() {
  const { t } = useTranslation();
  const items = t('testimonials.items', { returnObjects: true });
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-display">{t('testimonials.title')}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item, i) => (
          <blockquote key={i} className="p-6 rounded-lg border bg-white/60 dark:bg-slate-900/40">
            <p>“{item.quote}”</p>
            <footer className="mt-3 text-sm opacity-80">— {item.author}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
