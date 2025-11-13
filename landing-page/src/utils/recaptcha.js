export async function loadRecaptcha(siteKey) {
  if (!siteKey) return null;
  if (window.grecaptcha) return window.grecaptcha;
  await new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    s.async = true;
    s.onload = resolve;
    document.head.appendChild(s);
  });
  return window.grecaptcha;
}

export async function getRecaptchaToken(siteKey, action = 'submit') {
  const grecaptcha = await loadRecaptcha(siteKey);
  if (!grecaptcha) return '';
  return await grecaptcha.execute(siteKey, { action });
}
