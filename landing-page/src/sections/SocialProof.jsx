import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SocialProof() {
  const { t } = useTranslation();
  const logos = [
    { alt: 'Vercel', src: 'https://assets.vercel.com/image/upload/v1662130559/front/nextjs/twitter-card.png' },
    { alt: 'Unsplash', src: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Unsplash_logo.svg' },
    { alt: 'Netlify', src: 'https://www.netlify.com/v3/img/components/logomark.png' },
    { alt: 'GitHub', src: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }
  ];
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">{t('socialProof.title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
        {logos.map((l, i) => (
          <img key={i} src={l.src} alt={l.alt} className="max-h-10 opacity-70" loading="lazy" decoding="async" />
        ))}
      </div>
    </section>
  );
}
