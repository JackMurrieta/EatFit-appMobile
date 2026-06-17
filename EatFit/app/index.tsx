// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "@features/auth/useAuth";

export default function Index() {
  const { session, initializing } = useAuth();
  if (initializing) return null; // mientras se resuelve la sesión inicial
  return <Redirect href={session ? "/home" : "/auth"} />;
}