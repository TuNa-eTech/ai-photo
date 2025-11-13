import React from 'react';
import { useTranslation } from 'react-i18next';

export default function FAQ() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true });
  const [open, setOpen] = React.useState(-1);
  return (
    <section id="faq" aria-labelledby="faq-heading" className="space-y-8">
      <h2 id="faq-heading" className="text-3xl font-display">{t('faq.title')}</h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded border">
            <button
              className="w-full text-left px-4 py-3 font-medium flex justify-between items-center"
              aria-expanded={open === i}
              aria-controls={`faq-panel-${i}`}
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              {it.q}
              <span>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <div id={`faq-panel-${i}`} className="px-4 pb-4 text-sm opacity-90">{it.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
