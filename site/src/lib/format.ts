export function formatDate(d: string) {
  return new Date(d).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateTime(d: string) {
  return new Date(d).toLocaleString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// "11:00:00" (a Postgres time) → "上午11:00"; "19:30" → "下午7:30".
export function formatTime(t: string | null | undefined) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const period = h < 12 ? '上午' : '下午';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${period}${hour12}:${String(m).padStart(2, '0')}`;
}

// Today's date in Hong Kong as YYYY-MM-DD (matches the date columns).
export function todayInHongKong() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong' }).format(new Date());
}
