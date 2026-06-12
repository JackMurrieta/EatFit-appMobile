// app/_layout.tsx
import { Stack } from "expo-router";
import { AppProviders } from "@shared/providers/SafeAreaProvider";
import AuthProvider from "@features/auth/AuthProvider";

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </AppProviders>
  );
}