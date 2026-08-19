import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 9);

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#2446A8",
      tabBarInactiveTintColor: "#72809A",
      tabBarButton: HapticTab,
      tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 2 },
      tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: "#E3E8F3", height: 58 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <MaterialIcons color={color} name="home-filled" size={25} /> }} />
      <Tabs.Screen name="timetable" options={{ title: "Timetable", tabBarIcon: ({ color }) => <MaterialIcons color={color} name="calendar-month" size={25} /> }} />
      <Tabs.Screen name="attendance" options={{ title: "Attendance", tabBarIcon: ({ color }) => <MaterialIcons color={color} name="insights" size={24} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <MaterialIcons color={color} name="tune" size={24} /> }} />
      <Tabs.Screen name="admin" options={{ href: null }} />
    </Tabs>
  );
}
