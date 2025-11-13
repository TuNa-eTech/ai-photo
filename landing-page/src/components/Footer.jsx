import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-24 border-t">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <p>© {new Date().getFullYear()} AI Photo Studio. {t('footer.rights')}</p>
        <nav className="flex gap-6" aria-label="Footer">
          <Link to="/privacy" className="hover:underline">{t('footer.privacy')}</Link>
          <Link to="/terms" className="hover:underline">{t('footer.terms')}</Link>
        </nav>
      </div>
    </footer>
  );
}
