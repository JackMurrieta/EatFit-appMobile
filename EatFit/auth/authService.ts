import { supabase } from "@lib/supabase";

export async function fetchCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session ?? null;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

export async function signInWithGoogleToken(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function subscribeToAuthChanges(
  callback: (session: import("@supabase/supabase-js").Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange((_, session) => {
    callback(session);
  });
  return data.subscription;
}