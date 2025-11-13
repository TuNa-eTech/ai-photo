import React from 'react';
import { useTranslation } from 'react-i18next';
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const value = i18n.language && i18n.language.startsWith('vi') ? 'vi' : 'en';
  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        className="bg-transparent border rounded px-2 py-1"
        value={value}
        onChange={(e) => {
          i18n.changeLanguage(e.target.value);
          document.documentElement.setAttribute('lang', e.target.value);
        }}
      >
        <option value="en">EN</option>
        <option value="vi">VI</option>
      </select>
    </label>
  );
}
