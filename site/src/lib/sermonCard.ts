import { el, text } from './dom';
import { formatDate } from './format';
import { safeUrl } from './safeUrl';
import { sermonFileUrl } from './sermonFileUrl';
import { youtubeEmbed, youtubeId } from './youtube';

type Sermon = {
  title: string;
  speaker: string;
  sermon_date: string;
  file_path: string | null;
  recording_url: string | null;
  livestream_url: string | null;
};

// One sermon card, shared by the homepage ("最新講道") and /sermons.
// A YouTube recording plays inline; if there's no recording yet but the
// livestream link is a specific YouTube video, that plays inline instead.
export function renderSermon(item: Sermon) {
  const h3 = el('h3', {}, [text(item.title)]);
  const meta = el('div', { class: 'meta' }, [text(`${formatDate(item.sermon_date)} · 講員：${item.speaker}`)]);
  const children: Node[] = [h3, meta];

  const recording = safeUrl(item.recording_url);
  const livestream = safeUrl(item.livestream_url);
  const recordingId = youtubeId(recording);
  const embedId = recordingId ?? youtubeId(livestream);
  if (embedId) children.push(youtubeEmbed(embedId, `${item.title}（講道錄影）`));

  const actions = el('div', { class: 'actions' });
  if (livestream) {
    actions.appendChild(el('a', { class: 'btn btn-live', href: livestream, target: '_blank', rel: 'noopener noreferrer' }, [text('📡 觀看直播')]));
  }
  // Only offer an outbound 錄影 link when it couldn't be played on the page.
  if (recording && !recordingId) {
    actions.appendChild(el('a', { class: 'btn btn-secondary', href: recording, target: '_blank', rel: 'noopener noreferrer' }, [text('錄影')]));
  }
  if (item.file_path) {
    actions.appendChild(el('a', { class: 'btn btn-secondary', href: sermonFileUrl(item.file_path), target: '_blank', rel: 'noopener noreferrer' }, [text('下載：詩歌/經文')]));
  }
  if (actions.childNodes.length) children.push(actions);

  return el('div', { class: 'list-item' }, children);
}
