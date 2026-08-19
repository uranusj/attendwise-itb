import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { EmptyState, GroupChip } from "@/components/attendwise-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useAttendWise } from "@/lib/attendwise-store";
import type { Lecture } from "@/lib/attendwise-types";
import { TIMETABLE_EFFECTIVE_FROM, TIMETABLE_SOURCE_LABEL, WEEKDAYS } from "@/lib/sample-timetable";
import { useColors } from "@/hooks/use-colors";

function ScheduleRow({ lecture }: { lecture: Lecture }) {
  return (
    <View style={styles.sessionCard}>
      <View style={styles.timeRail}><Text style={styles.time}>{lecture.startTime}</Text><View style={styles.railDot} /><View style={styles.railLine} /><Text style={styles.endTime}>{lecture.endTime}</Text></View>
      <View style={styles.sessionBody}><View style={styles.sessionTop}><Text style={styles.subject}>{lecture.subject}</Text><GroupChip group={lecture.group} /></View><Text style={styles.code}>{lecture.subjectCode}  ·  {lecture.lectureType}</Text><View style={styles.locationRow}><MaterialIcons name="location-on" size={15} color="#6D7A94" /><Text style={styles.location}>{lecture.classroom}  ·  {lecture.teacher}</Text></View><Text style={styles.calendarHint}>Mark individual attendance in the Dates tab.</Text></View>
    </View>
  );
}

export default function TimetableScreen() {
  const { settings, visibleLectures } = useAttendWise();
  const colors = useColors();
  const [day, setDay] = useState("Monday");
  const [mode, setMode] = useState<"TIMETABLE" | "CALENDAR">("TIMETABLE");
  const lectures = visibleLectures(mode === "TIMETABLE" ? day : undefined);

  return (
    <ScreenContainer>
      <FlatList
        data={lectures}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
        ListHeaderComponent={<><Text style={styles.title}>{mode === "TIMETABLE" ? "Timetable" : "Calendar"}</Text><Text style={styles.subtitle}>ITB — {settings.subsection} · Common classes are always included</Text><View style={styles.modeToggle}><Pressable onPress={() => setMode("TIMETABLE")} style={({ pressed }) => [styles.modeButton, mode === "TIMETABLE" && styles.modeButtonSelected, pressed && styles.pressed]}><Text style={[styles.modeText, mode === "TIMETABLE" && styles.modeTextSelected]}>Weekly schedule</Text></Pressable><Pressable onPress={() => setMode("CALENDAR")} style={({ pressed }) => [styles.modeButton, mode === "CALENDAR" && styles.modeButtonSelected, pressed && styles.pressed]}><Text style={[styles.modeText, mode === "CALENDAR" && styles.modeTextSelected]}>Occurrences</Text></Pressable></View>{mode === "TIMETABLE" ? <View style={styles.weekdays}>{WEEKDAYS.map((weekday) => <Pressable key={weekday} onPress={() => setDay(weekday)} style={({ pressed }) => [styles.dayButton, day === weekday && styles.dayButtonSelected, pressed && styles.pressed]}><Text style={[styles.dayText, day === weekday && styles.dayTextSelected]}>{weekday.slice(0, 3)}</Text></Pressable>)}</View> : <View style={styles.calendarNote}><MaterialIcons name="info-outline" size={18} color="#2446A8" /><Text style={styles.calendarNoteText}>Change one occurrence without affecting the recurring weekly timetable.</Text></View>}<Text style={styles.dayHeading}>{mode === "TIMETABLE" ? day : "This week’s lecture occurrences"}</Text></>}
        renderItem={({ item }) => <ScheduleRow lecture={item} />}
        ListEmptyComponent={<EmptyState icon="event-busy" title="No sessions for this view" detail="The selected ITB subsection has no matching lecture occurrences." />}
        ListFooterComponent={<View style={styles.sourceCard}><MaterialIcons name="verified" size={21} color="#2446A8" /><View style={styles.sourceBody}><Text style={styles.sourceTitle}>Published timetable</Text><Text style={styles.sourceText}>{TIMETABLE_SOURCE_LABEL} · effective {TIMETABLE_EFFECTIVE_FROM}. Any new WhatsApp-shared update requires administrator review before publication.</Text></View></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: "#FFFFFF", padding: 18, paddingBottom: 38 },
  title: { color: "#10213F", fontSize: 28, fontWeight: "800", letterSpacing: -0.8, marginTop: 4 },
  subtitle: { color: "#6D7A94", fontSize: 13, marginTop: 5 },
  modeToggle: { backgroundColor: "#F3F4F6", borderRadius: 13, flexDirection: "row", marginTop: 18, padding: 4 },
  modeButton: { alignItems: "center", borderRadius: 10, flex: 1, paddingVertical: 9 },
  modeButtonSelected: { backgroundColor: "#FFFFFF" },
  modeText: { color: "#74819A", fontSize: 12, fontWeight: "800" },
  modeTextSelected: { color: "#2446A8" },
  weekdays: { flexDirection: "row", gap: 7, marginBottom: 21, marginTop: 17 },
  dayButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 11, borderWidth: 1, flex: 1, paddingVertical: 10 },
  dayButtonSelected: { backgroundColor: "#2446A8", borderColor: "#2446A8" },
  dayText: { color: "#61708A", fontSize: 11, fontWeight: "800" },
  dayTextSelected: { color: "#FFFFFF" },
  calendarNote: { alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 14, flexDirection: "row", gap: 8, marginBottom: 18, marginTop: 16, padding: 12 },
  calendarNoteText: { color: "#2446A8", flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 17 },
  dayHeading: { color: "#10213F", fontSize: 17, fontWeight: "800", marginBottom: 12 },
  sessionCard: { backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 19, borderWidth: 1, flexDirection: "row", marginBottom: 10, padding: 14 },
  timeRail: { alignItems: "center", paddingRight: 11, width: 56 },
  time: { color: "#10213F", fontSize: 12, fontWeight: "800" },
  railDot: { backgroundColor: "#2446A8", borderRadius: 99, height: 7, marginTop: 9, width: 7 },
  railLine: { backgroundColor: "#D8E0F0", flex: 1, marginVertical: 3, width: 1 },
  endTime: { color: "#7A879E", fontSize: 10, fontWeight: "700" },
  sessionBody: { borderLeftColor: "#E3E8F3", borderLeftWidth: 1, flex: 1, paddingLeft: 13 },
  sessionTop: { alignItems: "flex-start", flexDirection: "row", gap: 7, justifyContent: "space-between" },
  subject: { color: "#10213F", flex: 1, fontSize: 15, fontWeight: "800" },
  code: { color: "#6D7A94", fontSize: 11, marginTop: 3 },
  locationRow: { alignItems: "center", flexDirection: "row", gap: 4, marginTop: 9 },
  location: { color: "#52617A", flex: 1, fontSize: 11 },
  calendarHint: { color: "#2446A8", fontSize: 10, fontWeight: "700", marginTop: 11 },
  pressed: { opacity: 0.7 },
  sourceCard: { alignItems: "flex-start", backgroundColor: "#F9FAFB", borderRadius: 17, flexDirection: "row", gap: 10, marginTop: 14, padding: 14 },
  sourceBody: { flex: 1 },
  sourceTitle: { color: "#2446A8", fontSize: 13, fontWeight: "800" },
  sourceText: { color: "#52617A", fontSize: 11, lineHeight: 16, marginTop: 3 },
});
