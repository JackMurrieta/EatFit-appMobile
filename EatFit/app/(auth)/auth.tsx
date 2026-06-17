import { Redirect } from "expo-router";
import Screen from "@shared/layout/Screen";
import { AuthContent } from "@features/auth/components/AuthContent";
import { colors } from "@shared/theme/colors";
import { useAuth } from "@features/auth/useAuth";

export default function AuthPage() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/home" />;
  }

  return (
    <Screen scroll padded={false} backgroundColor={colors.background}>
      <AuthContent />
    </Screen>
  );
}