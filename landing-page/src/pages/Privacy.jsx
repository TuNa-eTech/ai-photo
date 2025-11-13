import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();
  const updated = t('legal.updated', { date: '2025-11-01' });

  const sections = [
    { id: 'collection', title: t('legal.privacy.sections.collection.title'), body: t('legal.privacy.sections.collection.body') },
    { id: 'usage', title: t('legal.privacy.sections.usage.title'), body: t('legal.privacy.sections.usage.body') },
    { id: 'sharing', title: t('legal.privacy.sections.sharing.title'), body: t('legal.privacy.sections.sharing.body') },
    { id: 'retention', title: t('legal.privacy.sections.retention.title'), body: t('legal.privacy.sections.retention.body') },
    { id: 'contact', title: t('legal.privacy.sections.contact.title'), body: t('legal.privacy.sections.contact.body') }
  ];

  return (
    <article aria-labelledby="privacy-title" className="mx-auto max-w-3xl text-slate-800 dark:text-slate-100">
      <header className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
        <h1 id="privacy-title" className="text-3xl font-semibold tracking-tight">
          {t('legal.privacy.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
          {updated}
        </p>
        <p className="mt-4 text-slate-700 dark:text-slate-300">{t('legal.privacy.intro')}</p>
      </header>

      <nav aria-label={t('legal.toc')} className="mb-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 p-4">
        <h2 className="text-sm font-medium mb-2">{t('legal.toc')}</h2>
        <ul className="list-disc list-inside space-y-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a className="text-brand-emphasis hover:underline" href={`#${s.id}`}>
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="text-xl font-semibold mb-3">
              {s.title}
            </h2>
            <p className="leading-7 text-slate-700 dark:text-slate-300">{s.body}</p>
          </section>
        ))}
      </div>

      <footer className="mt-12 text-sm text-slate-500 dark:text-slate-400">
        <a className="hover:underline" href="/terms">
          {t('footer.terms')}
        </a>
      </footer>
    </article>
  );
}