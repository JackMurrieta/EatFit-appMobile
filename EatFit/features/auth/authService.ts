import { supabase } from "../../infrastructure/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";

/* ── Sesión ───────────────────────────────────────────────── */

export async function fetchCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session ?? null;
}

export function subscribeToAuthChanges(
  callback: (session: import("@supabase/supabase-js").Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange((_, session) => {
    callback(session);
  });
  return data.subscription;
}

/* ── Correo / contraseña ──────────────────────────────────── */

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.session;
}

/* ── Google (OAuth vía navegador, manejado por Supabase) ──── */

// Pide a Supabase la URL de OAuth (sin redirigir automáticamente)
export async function getGoogleOAuthUrl(redirectTo: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  return data.url;
}

// Extrae los tokens de la URL de regreso y crea la sesión
export async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token } = params;
  if (!access_token) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
}

/* ── Sign out ─────────────────────────────────────────────── */

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}