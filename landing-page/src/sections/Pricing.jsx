import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Pricing() {
  const { t } = useTranslation();
  const [yearly, setYearly] = React.useState(false);
  const plans = t('pricing.plans', { returnObjects: true });
  const currency = t('pricing.currency');
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 id="pricing-heading" className="text-3xl font-display">{t('pricing.title')}</h2>
        <div className="flex items-center gap-2">
          <span className={!yearly ? 'font-semibold' : ''}>{t('pricing.toggle.monthly')}</span>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" aria-label="Toggle billing period" checked={yearly} onChange={(e) => setYearly(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-brand-emphasis relative after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 transition"></div>
          </label>
          <span className={yearly ? 'font-semibold' : ''}>{t('pricing.toggle.yearly')}</span>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p, i) => {
          const price = yearly ? p.priceY : p.priceM;
          return (
            <article key={i} className="p-6 rounded-lg border bg-white/60 dark:bg-slate-900/40">
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-3xl font-display">${price} <span className="text-sm font-normal">{currency}</span></p>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f, fi) => <li key={fi}>• {f}</li>)}
              </ul>
              <a href="#contact" className="mt-6 inline-block px-4 py-2 rounded bg-brand-emphasis text-white hover:opacity-90">Get started</a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
