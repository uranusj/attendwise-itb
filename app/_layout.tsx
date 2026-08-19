import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AttendWiseProvider } from "@/lib/attendwise-store";

export default function RootLayout() {
  return (
    <AttendWiseProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="oauth/callback" />
      </Stack>
    </AttendWiseProvider>
  );
}
