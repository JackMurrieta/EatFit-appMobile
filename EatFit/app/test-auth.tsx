// app/test-auth.tsx
// ⚠️  PANTALLA TEMPORAL — borra este archivo cuando termines las pruebas

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "../infrastructure/supabase";
import { getGoogleOAuthUrl, createSessionFromUrl } from "../features/auth/authService";

WebBrowser.maybeCompleteAuthSession();

// ── Cambia estos valores por cuentas reales de tu Supabase ──
const EXISTING_EMAIL = "jackmurrieta5@gmail.com";
const EXISTING_PASSWORD = "murrieta09";
const NEW_EMAIL = `nuevo_${Date.now()}@universidad.edu.mx`;
const NEW_PASSWORD = "password123";

type LineType = "ok" | "err" | "info" | "title";
type Line = { id: number; type: LineType; msg: string };

let _id = 0;

export default function TestAuthScreen() {
  const [lines, setLines] = useState<Line[]>([]);
  const [running, setRunning] = useState(false);
  const [googleRunning, setGoogleRunning] = useState(false);

  function push(type: LineType, msg: string) {
    const prefix =
      type === "ok"
        ? "✅"
        : type === "err"
          ? "❌"
          : type === "title"
            ? "▶"
            : "ℹ️ ";
    setLines((prev) => [
      ...prev,
      { id: _id++, type, msg: `${prefix}  ${msg}` },
    ]);
  }

  async function runGoogle() {
    setGoogleRunning(true);
    const redirectTo = makeRedirectUri();

    push("title", "Test Google OAuth");
    push("info", `redirectTo → ${redirectTo}`);

    try {
      const oauthUrl = await getGoogleOAuthUrl(redirectTo);
      if (!oauthUrl) {
        push("err", "getGoogleOAuthUrl devolvió null — revisa config de Google en Supabase");
        return;
      }
      push("ok", `OAuth URL obtenida → ${oauthUrl.slice(0, 60)}...`);
      push("info", "Abriendo navegador...");

      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectTo);
      push("info", `Browser result.type → ${result.type}`);

      if (result.type === "success") {
        push("ok", `URL de regreso → ${result.url.slice(0, 60)}...`);
        const session = await createSessionFromUrl(result.url);
        if (session) {
          push("ok", `Sesión creada → ${session.user.email}`);
          push("info", `Provider → ${session.user.app_metadata?.provider}`);
        } else {
          push("err", "createSessionFromUrl devolvió null — no se encontraron tokens en la URL");
        }
      } else if (result.type === "cancel") {
        push("info", "Usuario canceló el login en el navegador");
      } else {
        push("err", `Browser terminó con type: ${result.type}`);
      }
    } catch (e: any) {
      push("err", `Error → ${e.message}`);
    } finally {
      setGoogleRunning(false);
    }
  }

  async function runAll() {
    _id = 0;
    setLines([]);
    setRunning(true);

    // ── DEBUG: verifica que las variables llegan ──────────
    push("title", "Variables de entorno");
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    push(url ? "ok" : "err", `URL  → ${url ?? "UNDEFINED"}`);
    push(
      key ? "ok" : "err",
      `KEY  → ${key ? key.slice(0, 20) + "..." : "UNDEFINED"}`,
    );
    // ─────────────────────────────────────────────────────

    // ... resto de los tests

    // ────────────────────────────────────────────────────────
    // TEST 1 — signIn correcto
    // ────────────────────────────────────────────────────────
    push("title", "Test 1 — signIn (credenciales correctas)");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: EXISTING_EMAIL,
        password: EXISTING_PASSWORD,
      });
      if (error) throw error;
      push("ok", `Usuario → ${data.session?.user.email}`);
      push("info", `Token   → ${data.session?.access_token.slice(0, 28)}...`);
    } catch (e: any) {
      push("err", `signIn falló → ${e.message}`);
    }

    // ────────────────────────────────────────────────────────
    // TEST 2 — signIn contraseña incorrecta
    // ────────────────────────────────────────────────────────
    push("title", "Test 2 — signIn (contraseña incorrecta)");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: EXISTING_EMAIL,
        password: "wrong_password_xyz",
      });
      if (error) push("ok", `Error esperado → ${error.message}`);
      else push("err", "Debió fallar pero devolvió sesión");
    } catch (e: any) {
      push("ok", `Error esperado → ${e.message}`);
    }

    // ────────────────────────────────────────────────────────
    // TEST 3 — signUp correo nuevo
    // ────────────────────────────────────────────────────────
    push("title", "Test 3 — signUp (correo nuevo)");
    push("info", `Correo → ${NEW_EMAIL}`);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: NEW_EMAIL,
        password: NEW_PASSWORD,
      });
      if (error) throw error;
      if (data.session) {
        push("ok", `Registro exitoso con sesión → ${data.session.user.email}`);
      } else {
        push("ok", "Registro exitoso — email de confirmación enviado");
        push(
          "info",
          "session es null porque 'Confirm email' está activo en Supabase",
        );
      }
    } catch (e: any) {
      push("err", `signUp falló → ${e.message}`);
    }

    // ────────────────────────────────────────────────────────
    // TEST 4 — signUp correo duplicado
    // ────────────────────────────────────────────────────────
    push("title", "Test 4 — signUp (correo ya registrado)");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: EXISTING_EMAIL,
        password: EXISTING_PASSWORD,
      });
      if (error) {
        push("ok", `Error esperado → ${error.message}`);
      } else if (data.user && !data.session) {
        push("ok", "Supabase devolvió user sin sesión (duplicado manejado)");
      } else {
        push("err", "Debió fallar o devolver sin sesión");
      }
    } catch (e: any) {
      push("ok", `Error esperado → ${e.message}`);
    }

    // ────────────────────────────────────────────────────────
    // TEST 5 — getSession con sesión activa
    // ────────────────────────────────────────────────────────
    push("title", "Test 5 — getSession (después del signIn)");
    try {
      // Primero hace signIn para asegurar que hay sesión
      await supabase.auth.signInWithPassword({
        email: EXISTING_EMAIL,
        password: EXISTING_PASSWORD,
      });
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session) {
        push("ok", `Sesión activa → ${data.session.user.email}`);
        push(
          "info",
          `Expira → ${new Date(data.session.expires_at! * 1000).toLocaleString()}`,
        );
      } else {
        push("info", "Sin sesión persistida");
      }
    } catch (e: any) {
      push("err", `getSession falló → ${e.message}`);
    }

    // ────────────────────────────────────────────────────────
    // TEST 6 — signOut
    // ────────────────────────────────────────────────────────
    push("title", "Test 6 — signOut");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      push("ok", "signOut exitoso");

      // Verifica que la sesión quedó limpia
      const { data } = await supabase.auth.getSession();
      if (!data.session) push("ok", "Sesión limpia confirmada ✓");
      else push("err", "La sesión sigue activa después del signOut");
    } catch (e: any) {
      push("err", `signOut falló → ${e.message}`);
    }

    // ────────────────────────────────────────────────────────
    push("title", "Tests completados");
    setRunning(false);
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        {/* Header */}
        <Text style={s.header}>🧪 Test Supabase Auth</Text>
        <Text style={s.sub}>
          Probando conexión directa sin componentes de UI
        </Text>

        {/* Botón */}
        <Pressable
          style={({ pressed }) => [s.btn, (running || pressed) && s.btnDim]}
          onPress={runAll}
          disabled={running}
        >
          {running ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>
              {lines.length === 0 ? "▶  Correr tests" : "↺  Correr de nuevo"}
            </Text>
          )}
        </Pressable>

        {/* Botón Google OAuth */}
        <Pressable
          style={({ pressed }) => [s.btnGoogle, (googleRunning || pressed) && s.btnDim]}
          onPress={runGoogle}
          disabled={googleRunning}
        >
          {googleRunning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>🔵  Test Google OAuth</Text>
          )}
        </Pressable>

        {/* Resultados */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {lines.length === 0 && !running && (
            <Text style={s.empty}>
              Presiona el botón para iniciar los tests
            </Text>
          )}
          {lines.map((l) => (
            <Text
              key={l.id}
              style={[
                s.line,
                l.type === "ok" && s.ok,
                l.type === "err" && s.err,
                l.type === "title" && s.title,
                l.type === "info" && s.info,
              ]}
            >
              {l.msg}
            </Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0d0d0d" },
  screen: { flex: 1, paddingHorizontal: 18, paddingTop: 16 },
  header: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  sub: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#00C566",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  btnDim: { opacity: 0.5 },
  btnGoogle: {
    backgroundColor: "#4285F4",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  empty: { color: "#4b5563", textAlign: "center", marginTop: 40, fontSize: 13 },
  line: {
    fontSize: 13,
    marginBottom: 5,
    fontFamily: "monospace",
    color: "#9ca3af",
  },
  ok: { color: "#4ade80" },
  err: { color: "#f87171" },
  title: { color: "#facc15", fontWeight: "700", marginTop: 14, fontSize: 14 },
  info: { color: "#60a5fa" },
});
