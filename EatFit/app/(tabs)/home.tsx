import { View, Text, StyleSheet } from "react-native";
import { colors } from "@shared/theme/colors";

export default function HomeScreen() {
  return (
    <View style={s.container}>
      <Text style={s.text}>Home</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  text: { fontSize: 24, fontWeight: "700", color: colors.dark },
});
