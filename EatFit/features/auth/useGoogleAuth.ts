import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { makeRedirectUri } from "expo-auth-session";
import { getGoogleOAuthUrl, createSessionFromUrl } from "./authService";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);

    const redirectTo = makeRedirectUri();

    // Android (Chrome Custom Tabs): el redirect llega como deep link Intent
    // al Activity principal ANTES de que openAuthSessionAsync resuelva.
    // El listener lo captura aquí para no perderlo.
    let capturedUrl: string | null = null;
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("code=") || url.includes("access_token")) {
        capturedUrl = url;
      }
    });

    try {
      const oauthUrl = await getGoogleOAuthUrl(redirectTo);
      if (!oauthUrl) throw new Error("No se pudo obtener la URL de Google");

      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectTo);

      if (result.type === "success") {
        // iOS: ASWebAuthenticationSession devuelve la URL directamente
        await createSessionFromUrl(result.url);
      } else if (result.type === "dismiss" && capturedUrl) {
        // Android: Custom Tab cerrado por Intent — URL capturada por el listener
        await createSessionFromUrl(capturedUrl);
      }
      // "cancel": usuario cerró el browser manualmente — no es error
    } catch (e) {
      setError(e as Error);
    } finally {
      subscription.remove();
      setLoading(false);
    }
  }

  return { signInWithGoogle, loading, error };
}
