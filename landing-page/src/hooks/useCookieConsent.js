import React from 'react';
const STORAGE_KEY = 'cookie-consent';
export default function useCookieConsent() {
  const [consent, setConsent] = React.useState(localStorage.getItem(STORAGE_KEY) || 'unknown');
  const accept = () => { localStorage.setItem(STORAGE_KEY, 'accepted'); setConsent('accepted'); };
  const reject = () => { localStorage.setItem(STORAGE_KEY, 'rejected'); setConsent('rejected'); };
  return { consent, accept, reject };
}
