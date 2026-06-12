/* // app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "@features/auth/useAuth";

export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return null; // mientras carga la sesión
  return <Redirect href={session ? "/home" : "/auth"} />;
} */


  // app/index.tsx — TEMPORAL mientras pruebas
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/test-auth" />;
}
