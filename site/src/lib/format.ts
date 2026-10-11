export function formatDate(d: string) {
  return new Date(d).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateTime(d: string) {
  return new Date(d).toLocaleString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
