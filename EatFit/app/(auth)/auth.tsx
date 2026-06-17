// app/auth.tsx
import Screen from "@shared/layout/Screen";
import { AuthContent } from "@features/auth/components/AuthContent";
import { colors } from "@shared/theme/colors";

//imports 


export default function AuthPage() {
  return (
    <Screen scroll padded={false} backgroundColor={colors.background}>
      <AuthContent />
    </Screen>
  );
}