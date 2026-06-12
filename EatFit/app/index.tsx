// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "@features/auth/useAuth";

export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return null; // mientras carga la sesión
  return <Redirect href={session ? "/home" : "/auth"} />;
}