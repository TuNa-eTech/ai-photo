export function formatRelative(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const now = new Date();
  const diff = (date.getTime() - now.getTime()) / 1000; // seconds
  const abs = Math.abs(diff);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  const mins = diff / 60;
  if (Math.abs(mins) < 60) return rtf.format(Math.round(mins), 'minute');
  const hours = mins / 60;
  if (Math.abs(hours) < 24) return rtf.format(Math.round(hours), 'hour');
  const days = hours / 24;
  if (Math.abs(days) < 30) return rtf.format(Math.round(days), 'day');
  const months = days / 30;
  if (Math.abs(months) < 12) return rtf.format(Math.round(months), 'month');
  const years = months / 12;
  return rtf.format(Math.round(years), 'year');
}

export function formatCompactNumber(n?: number): string {
  if (typeof n !== 'number') return '—';
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
