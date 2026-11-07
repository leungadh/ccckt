import { el, text } from './dom';

// A link straight to a file (e.g. the old site's …/hymns-scripture.pdf) reads
// better as 「附件下載」 than 「了解更多」, which suits links to web pages.
const FILE_EXTENSIONS = /\.(pdf|docx?|pptx?|xlsx?|jpe?g|png)$/i;

export function isFileLink(url: string) {
  try {
    return FILE_EXTENSIONS.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

// The button for a post's URL 連結. Pass a URL already checked by safeUrl().
export function linkButton(url: string) {
  return el('a', { class: 'btn btn-secondary', href: url, target: '_blank', rel: 'noopener noreferrer' }, [
    text(isFileLink(url) ? '📄 附件下載' : '🔗 了解更多'),
  ]);
}
