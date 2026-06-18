import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import {
  fetchCurrentSession,
  subscribeToAuthChanges,
  signInWithEmail,
  signUpWithEmail,
  signOut,
} from "./authService";

export type AuthData = {
  initializing: boolean;
  submitting: boolean;
  session: Session | null;
  error: Error | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
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

  useEffect(() => {
    let mounted = true;

    fetchCurrentSession()
      .then((current) => mounted && setSession(current))
      .catch((e) => mounted && setError(e as Error))
      .finally(() => mounted && setInitializing(false));

    const subscription = subscribeToAuthChanges((next) => {
      if (!mounted) return;
      setSession(next);
      setError(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignInWithEmail(email: string, password: string) {
    try {
      setSubmitting(true);
      setError(null);
      await signInWithEmail(email, password);
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

  async function handleSignOut() {
    try {
      setSubmitting(true);
      await signOut();
    } catch (e) {
      setError(e as Error);
    } finally {
      setSubmitting(false);
    }
  }

  const value = useMemo<AuthData>(
    () => ({
      initializing,
      submitting,
      session,
      error,
      signInWithEmail: handleSignInWithEmail,
      signUpWithEmail: handleSignUpWithEmail,
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
