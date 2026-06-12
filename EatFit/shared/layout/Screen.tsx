// shared/layout/Screen.tsx
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
  type Edge,
} from "react-native-safe-area-context";

type ScreenProps = {
  children: React.ReactNode;
  /** Si la pantalla necesita scroll (formularios largos, listas cortas). */
  scroll?: boolean;
  /** Bordes seguros a respetar. Por defecto top y bottom. */
  edges?: Edge[];
  /** Aplica padding horizontal estándar al contenido. */
  padded?: boolean;
  /** Evita que el teclado tape los inputs (login, registro). */
  keyboardAvoiding?: boolean;
  /** Color de fondo de la pantalla. */
  backgroundColor?: string;
  /** Estilos extra para el contenedor SafeArea. */
  style?: ViewStyle;
  /** Estilos extra para el contenido interno. */
  contentContainerStyle?: ViewStyle;
};

const H_PADDING = 20;
const BOTTOM_BREATHING_ROOM = 24;

export default function Screen({
  children,
  scroll = false,
  edges = ["top", "bottom"],
  padded = true,
  keyboardAvoiding = true,
  backgroundColor = "#FFFFFF",
  style,
  contentContainerStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  // EL TRUCO DEL EDGE INFERIOR:
  // Si hay scroll, NO aplicamos el edge 'bottom' al SafeAreaView, porque
  // recortaría el área desplazable. En su lugar metemos insets.bottom como
  // paddingBottom DENTRO del scroll, así el contenido se desplaza completo
  // y el último elemento queda por encima del home indicator.
  const containerEdges: Edge[] = scroll
    ? edges.filter((edge) => edge !== "bottom")
    : edges;

  const innerPadding: ViewStyle = {
    paddingHorizontal: padded ? H_PADDING : 0,
  };

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        innerPadding,
        { paddingBottom: insets.bottom + BOTTOM_BREATHING_ROOM },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, innerPadding, contentContainerStyle]}>
      {children}
    </View>
  );

  const content = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor }, style]}
      edges={containerEdges}
    >
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
