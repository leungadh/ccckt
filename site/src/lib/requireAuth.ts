import { supabase } from './supabase';

export async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = '/admin/login';
    return null;
  }
  return data.session;
}
