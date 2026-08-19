import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AttendWiseProvider } from "@/lib/attendwise-store";
import { ThemeProvider, useThemeContext } from "@/lib/theme-provider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AttendWiseProvider>
        <AppNavigator />
      </AttendWiseProvider>
    </ThemeProvider>
  );
}

function AppNavigator() {
  const { colorScheme } = useThemeContext();
  return <><StatusBar style={colorScheme === "dark" ? "light" : "dark"} /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /><Stack.Screen name="oauth/callback" /></Stack></>;
}
