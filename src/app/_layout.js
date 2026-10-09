import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{
        headerStyle: { backgroundColor: "#2354D6" },
        headerTintColor: "#FFFFFF",
      }} />
    </SafeAreaProvider>
  );
}
