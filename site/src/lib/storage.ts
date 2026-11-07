// Helpers for files kept in Supabase Storage.

// Supabase Storage only accepts plain ASCII in file keys, so a name like
// 「十一月詩歌經文.pdf」 would be rejected on upload. Files are stored under a
// timestamp plus an ASCII-only version of the name; keep the original name
// separately for display and downloads.
export function storageKey(fileName: string) {
  const dot = fileName.lastIndexOf('.');
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const safeBase = base.normalize('NFKD').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return `${Date.now()}_${safeBase || 'file'}${ext ? `.${ext}` : ''}`;
}

// Public URL of a stored file. With downloadName, the browser downloads it
// under that (original) name instead of the stored key.
export function publicFileUrl(bucket: string, key: string, downloadName?: string | null) {
  const base = `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(key)}`;
  return downloadName ? `${base}?download=${encodeURIComponent(downloadName)}` : base;
}
