import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
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

const redirectTo = makeRedirectUri(); // usa tu scheme "eatfit"

export type AuthData = {
  loading: boolean;
  session: Session | null;
  error: Error | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthData>({
  loading: true,
  session: null,
  error: null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Sesión inicial + listener de cambios
  useEffect(() => {
    async function init() {
      try {
        const current = await fetchCurrentSession();
        setSession(current);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    init();

    const subscription = subscribeToAuthChanges((next) => {
      setSession(next);
      setError(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Captura el deep link de regreso del OAuth (incluye arranque en frío)
  const url = Linking.useURL();
  useEffect(() => {
    if (!url) return;
    createSessionFromUrl(url)
      .then((s) => s && setSession(s))
      .catch((e) => setError(e as Error));
  }, [url]);

  /* ── Handlers ──────────────────────────────────────────── */

  async function handleSignInWithEmail(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      const next = await signInWithEmail(email, password);
      setSession(next);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUpWithEmail(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      const next = await signUpWithEmail(email, password);
      setSession(next);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignInWithGoogle() {
    try {
      setError(null);
      const oauthUrl = await getGoogleOAuthUrl(redirectTo);
      if (!oauthUrl) return;

      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectTo);
      if (result.type === "success") {
        const next = await createSessionFromUrl(result.url);
        if (next) setSession(next);
      }
    } catch (e) {
      setError(e as Error);
    }
  }

  async function handleSignOut() {
    try {
      setLoading(true);
      await signOut();
      setSession(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        session,
        error,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
      }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  );
}