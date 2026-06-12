import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@features/auth/useAuth";
import { colors } from "@shared/theme/colors";
import styles from "./AuthContent.styles";

type Mode = "login" | "signup";

export function AuthContent() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading, error } =
    useAuth();

  const isLogin = mode === "login";
  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  const canSubmit = isValidEmail && password.length >= 6 && !loading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const cleanEmail = email.trim().toLowerCase();
    if (isLogin) signInWithEmail(cleanEmail, password);
    else signUpWithEmail(cleanEmail, password);
  };

  return (
    <View style={styles.container}>
      {/* Wordmark */}
      <View style={styles.logoRow}>
        <Text style={styles.logoDark}>Eat</Text>
        <Text style={styles.logoGreen}>F</Text>
        <Text style={styles.logoDark}>it</Text>
      </View>

      <Text style={styles.title}>
        {isLogin ? "Bienvenido" : "Crea tu cuenta"}
      </Text>
      <Text style={styles.subtitle}>
        {isLogin
          ? "Accede con tu correo institucional"
          : "Regístrate con tu correo institucional"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="correo@universidad.edu.mx"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
      />

      <View style={styles.passwordWrap}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          placeholderTextColor={colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          textContentType="password"
        />
        <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
          <Text style={styles.toggleText}>
            {showPassword ? "Ocultar" : "Mostrar"}
          </Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error.message}</Text>}

      <Pressable
        style={({ pressed }) => [
          styles.primaryBtn,
          !canSubmit && styles.primaryBtnDisabled,
          pressed && canSubmit && styles.primaryBtnPressed,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryBtnText}>
            {isLogin ? "Iniciar sesión" : "Registrarme"}
          </Text>
        )}
      </Pressable>

      <Pressable
        style={styles.switchRow}
        onPress={() => setMode(isLogin ? "signup" : "login")}
      >
        <Text style={styles.switchText}>
          {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <Text style={styles.switchAction}>
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </Text>
        </Text>
      </Pressable>

      {/* Divisor */}
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.line} />
      </View>

      {/* Social */}
      <Pressable style={styles.socialBtn} onPress={() => signInWithGoogle()}>
        <Text style={styles.socialText}>Continuar con Google</Text>
      </Pressable>

      {/*<Pressable style={styles.socialBtn} onPress={}>
        <Text style={styles.socialText}>Continuar con Apple</Text>
      </Pressable>*/}
    </View>
  );
}
