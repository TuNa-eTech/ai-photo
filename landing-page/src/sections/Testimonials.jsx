import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Testimonials() {
  const { t } = useTranslation();
  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-display">{t('testimonials.title')}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <blockquote className="p-6 rounded-lg border bg-white/60 dark:bg-slate-900/40">
          <p>“Studio-quality portraits without the studio. Love the cinematic styles!”</p>
          <footer className="mt-3 text-sm opacity-80">— Alex, Creator</footer>
        </blockquote>
        <blockquote className="p-6 rounded-lg border bg-white/60 dark:bg-slate-900/40">
          <p>“Anime looks are spot on. Perfect for my socials.”</p>
          <footer className="mt-3 text-sm opacity-80">— Minh, Influencer</footer>
        </blockquote>
      </div>
    </section>
  );
}
