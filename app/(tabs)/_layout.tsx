import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 9);

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted,
      tabBarButton: HapticTab,
      tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 2 },
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 58 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <IconSymbol color={color} name="house.fill" size={25} /> }} />
      <Tabs.Screen name="timetable" options={{ title: "Timetable", tabBarIcon: ({ color }) => <IconSymbol color={color} name="calendar" size={25} /> }} />
      <Tabs.Screen name="dates" options={{ title: "Dates", tabBarIcon: ({ color }) => <IconSymbol color={color} name="calendar.badge.clock" size={24} /> }} />
      <Tabs.Screen name="attendance" options={{ title: "Attendance", tabBarIcon: ({ color }) => <IconSymbol color={color} name="chart.bar.fill" size={24} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <IconSymbol color={color} name="gearshape.fill" size={24} /> }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
    </Tabs>
  );
}
