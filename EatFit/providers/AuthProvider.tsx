import { createContext, useState, useEffect, useContext } from "react";
import { router } from "expo-router";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@lib/supabase";

type AuthData = {
  loading: boolean;
  session: Session | null;
  error: Error | null;
};

const AuthContext = createContext<AuthData>({
  loading: true,
  session: null,
  error: null,
});

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setError(error);  // el componente decide qué hacer con el error
        setLoading(false);
        return;
      }

      setSession(data?.session ?? null);
      setLoading(false);
    }

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setLoading(false);
        setError(null); // limpia errores previos si la auth fue exitosa

        if (session) {
          router.replace("/");
        } else {
          router.replace("/signup");
        }
      },
    );

    return () => authListener?.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ loading, session, error }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);