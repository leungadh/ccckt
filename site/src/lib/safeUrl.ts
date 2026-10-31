// Only http(s) links are rendered as clickable; anything else (e.g. a
// `javascript:` URL typed into the admin form) is dropped.
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}
