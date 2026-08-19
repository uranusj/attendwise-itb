import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useMemo, useState } from "react";

import { GroupChip, SectionHeading, EmptyState } from "@/components/attendwise-ui";
import { attendancePercentage, recommendationFor } from "@/lib/attendance-calculations";
import { useAttendWise } from "@/lib/attendwise-store";
import type { Lecture, Subsection } from "@/lib/attendwise-types";
import { TIMETABLE_EFFECTIVE_FROM } from "@/lib/sample-timetable";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const dayForDate = (date: Date) => date.toLocaleDateString("en-US", { weekday: "long" });

function SetupScreen() {
  const [name, setName] = useState("");
  const [subsection, setSubsection] = useState<Subsection>("B1");
  const { completeSetup } = useAttendWise();

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={styles.setupScreen}>
        <View style={styles.brandMark}><MaterialIcons name="school" color="#FFFFFF" size={31} /></View>
        <Text style={styles.setupEyebrow}>GNDEC STUDENT COMPANION</Text>
        <Text style={styles.setupTitle}>AttendWise{`\n`}ITB</Text>
        <Text style={styles.setupDetail}>Know your next lecture, record attendance, and protect your 75% target.</Text>
        <View style={styles.setupCard}>
          <Text style={styles.fieldLabel}>YOUR NAME</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Aman" placeholderTextColor="#9AA5B8" style={styles.textInput} returnKeyType="done" />
          <Text style={[styles.fieldLabel, styles.sectionLabel]}>SECTION</Text>
          <View style={styles.lockedField}><Text style={styles.lockedText}>ITB</Text><MaterialIcons name="verified" size={18} color="#2446A8" /></View>
          <Text style={[styles.fieldLabel, styles.sectionLabel]}>SELECT YOUR SUBSECTION</Text>
          <View style={styles.choiceRow}>
            {(["B1", "B2"] as Subsection[]).map((option) => <Pressable key={option} onPress={() => setSubsection(option)} style={({ pressed }) => [styles.subsectionChoice, subsection === option && styles.subsectionChoiceSelected, pressed && styles.pressed]}><Text style={[styles.subsectionChoiceText, subsection === option && styles.subsectionChoiceTextSelected]}>{option}</Text></Pressable>)}
          </View>
          <Pressable onPress={() => completeSetup(name, subsection)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>Continue to dashboard</Text><MaterialIcons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable>
        </View>
        <Text style={styles.setupFootnote}>Local profile for this device. A verified GNDEC sign-in is not configured in this MVP.</Text>
      </View>
    </ScreenContainer>
  );
}

function LectureCard({ lecture, dateKey }: { lecture: Lecture; dateKey: string }) {
  const { getLectureStatus, markLecture } = useAttendWise();
  const status = getLectureStatus(lecture, dateKey);
  return (
    <View style={styles.lectureCard}>
      <View style={styles.lectureTime}><Text style={styles.timeStart}>{lecture.startTime}</Text><Text style={styles.timeEnd}>{lecture.endTime}</Text></View>
      <View style={styles.lectureBody}>
        <Text numberOfLines={1} style={styles.lectureSubject}>{lecture.subject}</Text>
        <Text style={styles.lectureMeta}>{lecture.classroom}  ·  {lecture.lectureType}</Text>
        <View style={styles.lectureFooter}><GroupChip group={lecture.group} />{status !== "NOT_MARKED" ? <Text style={[styles.recordedText, status === "PRESENT" ? styles.presentInk : styles.absentInk]}>{status === "PRESENT" ? "Present" : "Absent"}</Text> : null}</View>
        <View style={styles.attendanceButtons}>
          <Pressable onPress={() => markLecture(lecture, "PRESENT", dateKey)} style={({ pressed }) => [styles.presentButton, status === "PRESENT" && styles.presentButtonChosen, pressed && styles.pressed]}><MaterialIcons name="check" size={17} color={status === "PRESENT" ? "#FFFFFF" : "#18754E"} /><Text style={[styles.presentButtonText, status === "PRESENT" && styles.chosenButtonText]}>Present</Text></Pressable>
          <Pressable onPress={() => markLecture(lecture, "ABSENT", dateKey)} style={({ pressed }) => [styles.absentButton, status === "ABSENT" && styles.absentButtonChosen, pressed && styles.pressed]}><MaterialIcons name="close" size={17} color={status === "ABSENT" ? "#FFFFFF" : "#A5293A"} /><Text style={[styles.absentButtonText, status === "ABSENT" && styles.chosenButtonText]}>Absent</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { loading, settings, subjects, visibleLectures } = useAttendWise();
  const colors = useColors();
  const today = dayForDate(new Date());
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayLectures = visibleLectures(today);
  const overall = useMemo(() => {
    const present = subjects.reduce((sum, subject) => sum + subject.present, 0);
    const total = subjects.reduce((sum, subject) => sum + subject.present + subject.absent, 0);
    return total === 0 ? 0 : (present / total) * 100;
  }, [subjects]);
  const attention = useMemo(() => [...subjects].sort((a, b) => attendancePercentage(a) - attendancePercentage(b))[0], [subjects]);
  const nextLecture = todayLectures[0] ?? visibleLectures()[0];
  const hasAttendanceRecords = subjects.some((subject) => subject.present + subject.absent > 0);

  if (loading) return <ScreenContainer><View style={styles.loading}><ActivityIndicator color="#2446A8" size="large" /></View></ScreenContainer>;
  if (!settings.setupComplete) return <SetupScreen />;

  return (
    <ScreenContainer>
      <FlatList
        data={todayLectures}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
        ListHeaderComponent={<>
          <View style={styles.heroRow}><View><Text style={styles.greeting}>Good morning, {settings.name}</Text><Text style={styles.cohort}>GNDEC  ·  ITB — {settings.subsection}</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{settings.name.slice(0, 1).toUpperCase()}</Text></View></View>
          <View style={styles.attendanceHero}><View><Text style={styles.overallLabel}>OVERALL ATTENDANCE</Text><Text style={styles.overallValue}>{hasAttendanceRecords ? <>{overall.toFixed(1)}<Text style={styles.percentMark}>%</Text></> : "—"}</Text><Text style={styles.targetText}>{hasAttendanceRecords ? "Target: 75%" : "Mark real attendance to begin"}</Text></View><View style={styles.safePill}><MaterialIcons name={hasAttendanceRecords ? (overall >= 75 ? "verified" : "warning-amber") : "pending-actions"} size={16} color={hasAttendanceRecords ? (overall >= 75 ? "#18754E" : "#A65D00") : "#6D7A94"} /><Text style={[styles.safePillText, { color: hasAttendanceRecords ? (overall >= 75 ? "#18754E" : "#A65D00") : "#6D7A94" }]}>{hasAttendanceRecords ? (overall >= 75 ? "On track" : "Needs focus") : "No records"}</Text></View></View>
          {nextLecture ? <View style={styles.nextCard}><View style={styles.nextIcon}><MaterialIcons name="schedule" color="#2446A8" size={23} /></View><View style={styles.nextBody}><Text style={styles.nextLabel}>NEXT LECTURE</Text><Text style={styles.nextTitle}>{nextLecture.subject}</Text><Text style={styles.nextDetail}>{nextLecture.startTime}–{nextLecture.endTime}  ·  {nextLecture.classroom}</Text></View><GroupChip group={nextLecture.group} /></View> : null}
          <SectionHeading title={`Today · ${today}`} />
        </>}
        renderItem={({ item }) => <LectureCard lecture={item} dateKey={todayKey} />}
        ListEmptyComponent={<EmptyState icon="event-available" title="No scheduled lectures" detail="Your filtered ITB timetable has no lecture today. Review the week in Timetable." />}
        ListFooterComponent={<View style={styles.attentionWrap}><SectionHeading title={hasAttendanceRecords ? "Attention required" : "Attendance status"} />{hasAttendanceRecords ? <View style={styles.attentionCard}><View style={styles.attentionIcon}><MaterialIcons name="trending-up" size={20} color="#A5293A" /></View><View style={styles.attentionBody}><Text style={styles.attentionTitle}>{attention.subject}</Text><Text style={styles.attentionDetail}>{recommendationFor(attention).detail}</Text></View><Text style={styles.attentionPercent}>{attendancePercentage(attention).toFixed(1)}%</Text></View> : <View style={styles.attentionCard}><View style={styles.attentionIcon}><MaterialIcons name="fact-check" size={20} color="#2446A8" /></View><View style={styles.attentionBody}><Text style={styles.attentionTitle}>No attendance history yet</Text><Text style={styles.attentionDetail}>Classes are scheduled from 10 August. Record actual Present or Absent outcomes to start your calculation.</Text></View></View>}<Text style={styles.sampleNotice}>Verified GNDEC ITB timetable · effective {TIMETABLE_EFFECTIVE_FROM}</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", backgroundColor: "#F7F8FC", flex: 1, justifyContent: "center" },
  listContent: { backgroundColor: "#F7F8FC", padding: 18, paddingBottom: 40 },
  heroRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 18, marginTop: 4 },
  greeting: { color: "#10213F", fontSize: 23, fontWeight: "800", letterSpacing: -0.55 },
  cohort: { color: "#6D7A94", fontSize: 12, fontWeight: "700", marginTop: 5 },
  avatar: { alignItems: "center", backgroundColor: "#DCE5FF", borderRadius: 18, height: 42, justifyContent: "center", width: 42 },
  avatarText: { color: "#2446A8", fontSize: 17, fontWeight: "800" },
  attendanceHero: { backgroundColor: "#10213F", borderRadius: 24, flexDirection: "row", justifyContent: "space-between", marginBottom: 14, overflow: "hidden", padding: 21 },
  overallLabel: { color: "#BFD0FF", fontSize: 10, fontWeight: "800", letterSpacing: 1.05 },
  overallValue: { color: "#FFFFFF", fontSize: 39, fontWeight: "800", letterSpacing: -1.5, marginTop: 3 },
  percentMark: { color: "#C8D4F7", fontSize: 20 },
  targetText: { color: "#C8D4F7", fontSize: 12, fontWeight: "600" },
  safePill: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#E2F5EC", borderRadius: 99, flexDirection: "row", gap: 4, paddingHorizontal: 10, paddingVertical: 7 },
  safePillText: { fontSize: 11, fontWeight: "800" },
  nextCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 20, borderWidth: 1, flexDirection: "row", marginBottom: 24, padding: 15 },
  nextIcon: { alignItems: "center", backgroundColor: "#E8EDFF", borderRadius: 14, height: 46, justifyContent: "center", width: 46 },
  nextBody: { flex: 1, marginLeft: 12 },
  nextLabel: { color: "#6D7A94", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  nextTitle: { color: "#10213F", fontSize: 16, fontWeight: "800", marginTop: 2 },
  nextDetail: { color: "#6D7A94", fontSize: 12, marginTop: 2 },
  lectureCard: { backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 20, borderWidth: 1, flexDirection: "row", marginBottom: 10, overflow: "hidden", padding: 14 },
  lectureTime: { borderRightColor: "#E3E8F3", borderRightWidth: 1, paddingRight: 12, width: 61 },
  timeStart: { color: "#10213F", fontSize: 14, fontWeight: "800" },
  timeEnd: { color: "#7A879E", fontSize: 11, marginTop: 3 },
  lectureBody: { flex: 1, marginLeft: 13 },
  lectureSubject: { color: "#10213F", fontSize: 16, fontWeight: "800" },
  lectureMeta: { color: "#6D7A94", fontSize: 12, marginTop: 3 },
  lectureFooter: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 9 },
  recordedText: { fontSize: 11, fontWeight: "800" },
  presentInk: { color: "#18754E" },
  absentInk: { color: "#A5293A" },
  attendanceButtons: { flexDirection: "row", gap: 8, marginTop: 12 },
  presentButton: { alignItems: "center", backgroundColor: "#EFF9F4", borderColor: "#BFE4D1", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 4, justifyContent: "center", paddingVertical: 8, width: 96 },
  presentButtonChosen: { backgroundColor: "#18754E", borderColor: "#18754E" },
  presentButtonText: { color: "#18754E", fontSize: 12, fontWeight: "800" },
  absentButton: { alignItems: "center", backgroundColor: "#FFF4F5", borderColor: "#F0C7CE", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 4, justifyContent: "center", paddingVertical: 8, width: 91 },
  absentButtonChosen: { backgroundColor: "#A5293A", borderColor: "#A5293A" },
  absentButtonText: { color: "#A5293A", fontSize: 12, fontWeight: "800" },
  chosenButtonText: { color: "#FFFFFF" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  attentionWrap: { marginTop: 17 },
  attentionCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 18, borderWidth: 1, flexDirection: "row", padding: 14 },
  attentionIcon: { alignItems: "center", backgroundColor: "#FCE5E8", borderRadius: 13, height: 40, justifyContent: "center", width: 40 },
  attentionBody: { flex: 1, marginLeft: 11 },
  attentionTitle: { color: "#10213F", fontSize: 14, fontWeight: "800" },
  attentionDetail: { color: "#6D7A94", fontSize: 11, lineHeight: 16, marginTop: 3 },
  attentionPercent: { color: "#A5293A", fontSize: 15, fontWeight: "800" },
  sampleNotice: { color: "#7A879E", fontSize: 11, marginBottom: 8, marginTop: 17, textAlign: "center" },
  setupScreen: { alignItems: "center", backgroundColor: "#F7F8FC", flex: 1, justifyContent: "center", padding: 24 },
  brandMark: { alignItems: "center", backgroundColor: "#2446A8", borderRadius: 20, height: 63, justifyContent: "center", width: 63 },
  setupEyebrow: { color: "#2446A8", fontSize: 10, fontWeight: "800", letterSpacing: 1.3, marginTop: 18 },
  setupTitle: { color: "#10213F", fontSize: 38, fontWeight: "800", letterSpacing: -1.4, lineHeight: 42, marginTop: 7, textAlign: "center" },
  setupDetail: { color: "#6D7A94", fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: "center" },
  setupCard: { backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 24, borderWidth: 1, marginTop: 25, padding: 19, width: "100%" },
  fieldLabel: { color: "#6D7A94", fontSize: 10, fontWeight: "800", letterSpacing: 0.85 },
  sectionLabel: { marginTop: 18 },
  textInput: { borderBottomColor: "#CBD4E4", borderBottomWidth: 1, color: "#10213F", fontSize: 17, fontWeight: "700", paddingBottom: 9, paddingTop: 7 },
  lockedField: { alignItems: "center", backgroundColor: "#F0F4FF", borderRadius: 11, flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingHorizontal: 13, paddingVertical: 12 },
  lockedText: { color: "#2446A8", fontSize: 15, fontWeight: "800" },
  choiceRow: { flexDirection: "row", gap: 10, marginTop: 9 },
  subsectionChoice: { alignItems: "center", backgroundColor: "#F4F6FA", borderColor: "#DDE3EF", borderRadius: 11, borderWidth: 1, flex: 1, paddingVertical: 12 },
  subsectionChoiceSelected: { backgroundColor: "#E8EDFF", borderColor: "#2446A8" },
  subsectionChoiceText: { color: "#72809A", fontSize: 15, fontWeight: "800" },
  subsectionChoiceTextSelected: { color: "#2446A8" },
  primaryButton: { alignItems: "center", backgroundColor: "#2446A8", borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 23, paddingVertical: 15 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  setupFootnote: { color: "#8490A5", fontSize: 11, lineHeight: 16, marginTop: 16, textAlign: "center" },
});
