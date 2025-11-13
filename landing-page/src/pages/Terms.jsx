import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { t } = useTranslation();
  const updated = t('legal.updated', { date: '2025-11-01' });

  const sections = [
    { id: 'acceptance', title: t('legal.terms.sections.acceptance.title'), body: t('legal.terms.sections.acceptance.body') },
    { id: 'accounts', title: t('legal.terms.sections.accounts.title'), body: t('legal.terms.sections.accounts.body') },
    { id: 'usage', title: t('legal.terms.sections.usage.title'), body: t('legal.terms.sections.usage.body') },
    { id: 'liability', title: t('legal.terms.sections.liability.title'), body: t('legal.terms.sections.liability.body') },
    { id: 'contact', title: t('legal.terms.sections.contact.title'), body: t('legal.terms.sections.contact.body') }
  ];

  return (
    <article aria-labelledby="terms-title" className="mx-auto max-w-3xl text-slate-800 dark:text-slate-100">
      <header className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
        <h1 id="terms-title" className="text-3xl font-semibold tracking-tight">
          {t('legal.terms.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
          {updated}
        </p>
        <p className="mt-4 text-slate-700 dark:text-slate-300">{t('legal.terms.intro')}</p>
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
        <a className="hover:underline" href="/privacy">
          {t('footer.privacy')}
        </a>
      </footer>
    </article>
  );
}