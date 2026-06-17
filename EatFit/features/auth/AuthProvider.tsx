import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import type { Session } from "@supabase/supabase-js";

import {
  fetchCurrentSession,
  subscribeToAuthChanges,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getGoogleOAuthUrl,
  createSessionFromUrl,
} from "./authService";

WebBrowser.maybeCompleteAuthSession();

export type AuthData = {
  initializing: boolean; // arranque: ¿ya sabemos si hay sesión?
  submitting: boolean; // acción en curso (para los botones)
  session: Session | null;
  error: Error | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthData | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // 1) Sesión inicial + listener (ÚNICA fuente de verdad de `session`)
  useEffect(() => {
    let mounted = true;

    fetchCurrentSession()
      .then((current) => mounted && setSession(current))
      .catch((e) => mounted && setError(e as Error))
      .finally(() => mounted && setInitializing(false));

    const subscription = subscribeToAuthChanges((next) => {
      if (!mounted) return;
      setSession(next); // aquí se actualiza la sesión SIEMPRE
      setError(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ── Handlers: disparan la acción, NO tocan `session` ─────── */

  async function handleSignInWithEmail(email: string, password: string) {
    try {
      setSubmitting(true);
      setError(null);
      await signInWithEmail(email, password); // el listener pone la sesión
    } catch (e) {
      setError(e as Error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignUpWithEmail(email: string, password: string) {
    try {
      setSubmitting(true);
      setError(null);
      await signUpWithEmail(email, password);
    } catch (e) {
      setError(e as Error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignInWithGoogle() {
    try {
      setSubmitting(true);
      setError(null);
      const redirectTo = makeRedirectUri();
      const oauthUrl = await getGoogleOAuthUrl(redirectTo);
      if (!oauthUrl) {
        setError(new Error("No se pudo obtener la URL de Google"));
        return;
      }
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl,
        redirectTo,
      );
      if (result.type === "success") {
        await createSessionFromUrl(result.url); // el listener actualiza la sesión
      }
      // "cancel" / "dismiss": el usuario cerró el navegador, no es error
    } catch (e) {
      setError(e as Error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    try {
      setSubmitting(true);
      await signOut(); // el listener pondrá session = null
    } catch (e) {
      setError(e as Error);
    } finally {
      setSubmitting(false);
    }
  }

  // 3) Memoiza el value para no re-renderizar consumidores de más
  const value = useMemo<AuthData>(
    () => ({
      initializing,
      submitting,
      session,
      error,
      signInWithEmail: handleSignInWithEmail,
      signUpWithEmail: handleSignUpWithEmail,
      signInWithGoogle: handleSignInWithGoogle,
      signOut: handleSignOut,
    }),
    [initializing, submitting, session, error],
  );

  return (
    <AuthContext.Provider value={value}>
      {initializing ? null : children}
    </AuthContext.Provider>
  );
}
