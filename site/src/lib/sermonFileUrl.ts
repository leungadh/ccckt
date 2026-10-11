export function sermonFileUrl(filePath: string) {
  return `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/sermon-files/${filePath}`;
}
