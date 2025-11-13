import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector('a,button,select');
    first?.focus();
  }, [open]);

  const appUrl = import.meta.env.VITE_APP_STORE_URL || 'https://apps.apple.com/app/id1234567890';

  return (
    <header className="sticky top-0 z-50 bg-brand-base/80 backdrop-blur border-b">
      <nav className="container flex items-center justify-between py-3">
        <a href="#" className="font-display text-xl tracking-tight">AI Photo Studio</a>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="hover:underline">{t('nav.features')}</a>
          <a href="#pricing" className="hover:underline">{t('nav.pricing')}</a>
          <a href="#faq" className="hover:underline">{t('nav.faq')}</a>
          <a href={appUrl} className="px-4 py-2 rounded bg-brand-emphasis text-white hover:opacity-90">
            {t('cta.download')}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <button
          className="md:hidden border rounded px-3 py-1"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" ref={menuRef} className="md:hidden border-t">
          <div className="container py-3 flex flex-col gap-3">
            <a href="#features" onClick={() => setOpen(false)} className="hover:underline">{t('nav.features')}</a>
            <a href="#pricing" onClick={() => setOpen(false)} className="hover:underline">{t('nav.pricing')}</a>
            <a href="#faq" onClick={() => setOpen(false)} className="hover:underline">{t('nav.faq')}</a>
            <a href={appUrl} onClick={() => setOpen(false)} className="px-4 py-2 rounded bg-brand-emphasis text-white hover:opacity-90">{t('cta.download')}</a>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
