// shared/providers/AppProviders.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      {/* aquí luego: ThemeProvider, QueryClientProvider, AuthProvider... */}
      {children}
    </SafeAreaProvider>
  );
}