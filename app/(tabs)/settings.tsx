import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { useAttendWise } from "@/lib/attendwise-store";
import { scheduleLectureReminders } from "@/lib/lecture-reminders";
import type { StudentSettings, Subsection } from "@/lib/attendwise-types";

const SOURCE_URL = "appsc.gndec.ac.in … /09_08_2026 FINAL_FILE R4";

export default function SettingsScreen() {
  const { settings, updateSubsection, updateReminderMinutes, visibleLectures, resetSetup } = useAttendWise();
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [reminderStatus, setReminderStatus] = useState("Not scheduled yet");
  const reminderChoices: StudentSettings["reminderMinutes"][] = [5, 10, 15, 30];

  const handleScheduleReminders = async () => {
    try {
      const result = await scheduleLectureReminders(visibleLectures(), settings.reminderMinutes);
      if (result.status === "scheduled") {
        setReminderStatus(`${result.count} reminders scheduled for the next 14 days`);
      } else if (result.status === "permission-denied") {
        setReminderStatus("Notification permission was not granted");
      } else {
        setReminderStatus("Use an Android device to schedule local reminders");
      }
    } catch {
      setReminderStatus("Could not schedule reminders. Please try again on device.");
    }
  };
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Your ITB timetable and reminder preferences.</Text>
        <Text style={styles.heading}>Student profile</Text>
        <View style={styles.profileCard}><View style={styles.profileInitial}><Text style={styles.profileInitialText}>{settings.name.slice(0, 1).toUpperCase()}</Text></View><View style={styles.profileBody}><Text style={styles.profileName}>{settings.name}</Text><Text style={styles.profileMeta}>GNDEC · ITB — {settings.subsection}</Text></View><MaterialIcons name="verified-user" size={21} color="#2446A8" /></View>
        <Text style={styles.heading}>Subsection</Text>
        <View style={styles.card}><Text style={styles.cardDetail}>Only your subgroup and Common ITB lectures appear in your future timetable.</Text><View style={styles.choiceRow}>{(["B1", "B2"] as Subsection[]).map((option) => <Pressable key={option} onPress={() => updateSubsection(option)} style={({ pressed }) => [styles.choice, settings.subsection === option && styles.choiceSelected, pressed && styles.pressed]}><Text style={[styles.choiceText, settings.subsection === option && styles.choiceTextSelected]}>ITB — {option}</Text>{settings.subsection === option ? <MaterialIcons name="check-circle" size={16} color="#2446A8" /> : null}</Pressable>)}</View></View>
        <Text style={styles.heading}>Lecture reminders</Text>
        <View style={styles.card}><View style={styles.settingRow}><View style={styles.settingIcon}><MaterialIcons name="notifications-active" size={20} color="#2446A8" /></View><View style={styles.settingBody}><Text style={styles.settingTitle}>Remind before lectures</Text><Text style={styles.cardDetail}>Notification scheduling is configured on your device.</Text></View></View><View style={styles.reminderGrid}>{reminderChoices.map((minutes) => <Pressable key={minutes} onPress={() => updateReminderMinutes(minutes)} style={({ pressed }) => [styles.reminderChoice, settings.reminderMinutes === minutes && styles.reminderChoiceSelected, pressed && styles.pressed]}><Text style={[styles.reminderText, settings.reminderMinutes === minutes && styles.reminderTextSelected]}>{minutes} min</Text></Pressable>)}</View><Pressable onPress={handleScheduleReminders} style={({ pressed }) => [styles.scheduleButton, pressed && styles.pressed]}><MaterialIcons name="notifications" size={18} color="#FFFFFF" /><Text style={styles.scheduleButtonText}>Schedule next 14 days</Text></Pressable><Text style={styles.reminderStatus}>{reminderStatus}</Text><View style={styles.localNotice}><MaterialIcons name="info-outline" size={16} color="#6D7A94" /><Text style={styles.localNoticeText}>Enable notification permission when prompted after scheduling. Remote FCM delivery is not configured.</Text></View></View>
        <Text style={styles.heading}>Timetable management</Text>
        <View style={styles.card}><View style={styles.settingRow}><View style={styles.settingIcon}><MaterialIcons name="table-chart" size={20} color="#2446A8" /></View><View style={styles.settingBody}><Text style={styles.settingTitle}>Public source registered</Text><Text style={styles.cardDetail}>{SOURCE_URL}</Text></View></View><Pressable onPress={() => setShowImportPreview((visible) => !visible)} style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}><MaterialIcons name="refresh" size={18} color="#2446A8" /><Text style={styles.outlineButtonText}>{showImportPreview ? "Close import preview" : "Refresh timetable · Preview"}</Text></Pressable>{showImportPreview ? <View style={styles.preview}><Text style={styles.previewTitle}>Safe import preview</Text><Text style={styles.previewText}>Detected collection model: individual ITB1 and ITB2 source tables. Publishing remains disabled until an administrator reviews subjects, rooms, teachers, and subgroup assignments.</Text><View style={styles.previewRow}><Text style={styles.previewLabel}>Source status</Text><Text style={styles.previewValue}>Review required</Text></View><View style={styles.previewRow}><Text style={styles.previewLabel}>Current student data</Text><Text style={styles.previewValue}>Unchanged</Text></View></View> : null}</View>
        <Pressable onPress={() => Alert.alert("Restart local setup?", "This clears locally stored attendance and returns to subsection selection.", [{ text: "Cancel", style: "cancel" }, { text: "Restart", style: "destructive", onPress: resetSetup }])} style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}><MaterialIcons name="restart-alt" size={18} color="#A5293A" /><Text style={styles.resetText}>Restart local setup</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F7F8FC", padding: 18, paddingBottom: 40 },
  title: { color: "#10213F", fontSize: 28, fontWeight: "800", letterSpacing: -0.8, marginTop: 4 },
  subtitle: { color: "#6D7A94", fontSize: 13, marginTop: 5 },
  heading: { color: "#10213F", fontSize: 16, fontWeight: "800", marginBottom: 10, marginTop: 23 },
  profileCard: { alignItems: "center", backgroundColor: "#10213F", borderRadius: 20, flexDirection: "row", padding: 15 },
  profileInitial: { alignItems: "center", backgroundColor: "#DCE5FF", borderRadius: 17, height: 44, justifyContent: "center", width: 44 },
  profileInitialText: { color: "#2446A8", fontSize: 17, fontWeight: "800" },
  profileBody: { flex: 1, marginLeft: 11 },
  profileName: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  profileMeta: { color: "#C8D4F7", fontSize: 12, marginTop: 3 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 19, borderWidth: 1, padding: 15 },
  cardDetail: { color: "#6D7A94", fontSize: 12, lineHeight: 17 },
  choiceRow: { flexDirection: "row", gap: 9, marginTop: 13 },
  choice: { alignItems: "center", backgroundColor: "#F7F8FC", borderColor: "#E3E8F3", borderRadius: 11, borderWidth: 1, flex: 1, flexDirection: "row", gap: 5, justifyContent: "center", paddingVertical: 11 },
  choiceSelected: { backgroundColor: "#E8EDFF", borderColor: "#2446A8" },
  choiceText: { color: "#72809A", fontSize: 12, fontWeight: "800" },
  choiceTextSelected: { color: "#2446A8" },
  settingRow: { alignItems: "center", flexDirection: "row" },
  settingIcon: { alignItems: "center", backgroundColor: "#E8EDFF", borderRadius: 12, height: 40, justifyContent: "center", width: 40 },
  settingBody: { flex: 1, marginLeft: 10 },
  settingTitle: { color: "#10213F", fontSize: 14, fontWeight: "800", marginBottom: 3 },
  reminderGrid: { flexDirection: "row", gap: 7, marginTop: 15 },
  reminderChoice: { alignItems: "center", backgroundColor: "#F7F8FC", borderColor: "#E3E8F3", borderRadius: 9, borderWidth: 1, flex: 1, paddingVertical: 9 },
  reminderChoiceSelected: { backgroundColor: "#2446A8", borderColor: "#2446A8" },
  reminderText: { color: "#72809A", fontSize: 11, fontWeight: "800" },
  reminderTextSelected: { color: "#FFFFFF" },
  scheduleButton: { alignItems: "center", backgroundColor: "#2446A8", borderRadius: 11, flexDirection: "row", gap: 7, justifyContent: "center", marginTop: 14, paddingVertical: 11 },
  scheduleButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  reminderStatus: { color: "#2446A8", fontSize: 11, fontWeight: "700", marginTop: 10, textAlign: "center" },
  localNotice: { alignItems: "flex-start", flexDirection: "row", gap: 6, marginTop: 14 },
  localNoticeText: { color: "#6D7A94", flex: 1, fontSize: 11, lineHeight: 16 },
  outlineButton: { alignItems: "center", borderColor: "#2446A8", borderRadius: 11, borderWidth: 1, flexDirection: "row", gap: 7, justifyContent: "center", marginTop: 15, paddingVertical: 11 },
  outlineButtonText: { color: "#2446A8", fontSize: 12, fontWeight: "800" },
  preview: { backgroundColor: "#F0F4FF", borderRadius: 13, marginTop: 12, padding: 12 },
  previewTitle: { color: "#2446A8", fontSize: 13, fontWeight: "800" },
  previewText: { color: "#52617A", fontSize: 11, lineHeight: 16, marginTop: 4 },
  previewRow: { borderTopColor: "#D4DDFC", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 9, paddingTop: 8 },
  previewLabel: { color: "#6D7A94", fontSize: 10, fontWeight: "700" },
  previewValue: { color: "#2446A8", fontSize: 10, fontWeight: "800" },
  resetButton: { alignItems: "center", flexDirection: "row", gap: 7, justifyContent: "center", marginTop: 25, paddingVertical: 12 },
  resetText: { color: "#A5293A", fontSize: 12, fontWeight: "800" },
  pressed: { opacity: 0.68 },
});
