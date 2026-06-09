import { createContext, useState, useEffect } from "react";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import type { Session } from "@supabase/supabase-js";
import {
  fetchCurrentSession,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogleToken,
  signOut,
  subscribeToAuthChanges,
} from "./authService";

WebBrowser.maybeCompleteAuthSession();

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
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const [_, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  // Respuesta de Google OAuth
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const idToken = googleResponse.authentication?.idToken;
      if (idToken) handleGoogleToken(idToken);
    } else if (googleResponse?.type === "error") {
      setError(new Error("Google sign-in failed"));
    }
  }, [googleResponse]);

  // Sesión inicial + listener
  useEffect(() => {
    async function init() {
      try {
        const session = await fetchCurrentSession();
        setSession(session);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    init();

    const subscription = subscribeToAuthChanges((session) => {
      setSession(session);
      setError(null);
      setLoading(false);

      if (session) {
        router.replace("/");
      } else {
        router.replace("/signup");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Handlers que llaman al service ---

  async function handleGoogleToken(idToken: string) {
    try {
      setLoading(true);
      const session = await signInWithGoogleToken(idToken);
      setSession(session);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignInWithGoogle() {
    setError(null);
    await promptGoogleAsync();
  }

  async function handleSignInWithEmail(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      const session = await signInWithEmail(email, password);
      setSession(session);
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
      const session = await signUpWithEmail(email, password);
      setSession(session);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
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