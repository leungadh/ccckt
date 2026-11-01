import { supabase } from './supabase';

export async function requireAuth() {
  // Arriving from an emailed login link that has expired or was already used:
  // Supabase sends the person back with an error in the URL instead of a session.
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const query = new URLSearchParams(window.location.search);
  const linkError = hash.get('error_code') ?? hash.get('error') ?? query.get('error_code');
  if (linkError) {
    window.location.href = `/admin/login?error=${encodeURIComponent(linkError)}`;
    return null;
  }

  // getSession() also picks up a fresh session from a valid login link
  // (the #access_token=… part of the URL) and saves it in this browser.
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = '/admin/login';
    return null;
  }
  return data.session;
}
