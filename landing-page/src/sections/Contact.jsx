import React from 'react';
import { useTranslation } from 'react-i18next';
import { getRecaptchaToken } from '../utils/recaptcha.js';

export default function Contact() {
  const { t } = useTranslation();
  const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [status, setStatus] = React.useState('idle'); // idle|loading|success|error
  const [errors, setErrors] = React.useState({});

  function validate() {
    const e = {};
    if (!name.trim()) e.name = t('form.validation.name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('form.validation.email');
    if (!message.trim()) e.message = t('form.validation.message');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    try {
      const token = await getRecaptchaToken(siteKey, 'contact_submit');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, 'g-recaptcha-response': token })
      });
      if (res.ok) {
        setStatus('success');
        setName(''); setEmail(''); setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-heading" className="space-y-6">
      <h2 id="contact-heading" className="text-3xl font-display">{t('form.title')}</h2>
      <form onSubmit={onSubmit} noValidate className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="name">{t('form.name')}</label>
          <input id="name" name="name" className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby="name-err" />
          {errors.name && <p id="name-err" role="alert" className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="email">{t('form.email')}</label>
          <input id="email" name="email" className="w-full border rounded px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby="email-err" />
          {errors.email && <p id="email-err" role="alert" className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1" htmlFor="message">{t('form.message')}</label>
          <textarea id="message" name="message" rows="4" className="w-full border rounded px-3 py-2" value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={!!errors.message} aria-describedby="msg-err"></textarea>
          {errors.message && <p id="msg-err" role="alert" className="text-sm text-red-600 mt-1">{errors.message}</p>}
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <button disabled={status === 'loading'} className="px-4 py-2 rounded bg-brand-emphasis text-white hover:opacity-90 disabled:opacity-60">
            {t('form.submit')}
          </button>
          {status === 'success' && <div role="status" className="text-green-700">{t('form.success')}</div>}
          {status === 'error' && <div role="alert" className="text-red-700">{t('form.error')}</div>}
        </div>
      </form>
    </section>
  );
}
