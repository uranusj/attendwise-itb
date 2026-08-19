import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { RecommendationChip } from "@/components/attendwise-ui";
import { ScreenContainer } from "@/components/screen-container";
import { attendancePercentage, markedTotal, recommendationFor } from "@/lib/attendance-calculations";
import { useAttendWise } from "@/lib/attendwise-store";
import type { SubjectAttendance } from "@/lib/attendwise-types";

function SubjectCard({ subject }: { subject: SubjectAttendance }) {
  const percentage = attendancePercentage(subject);
  const recommendation = recommendationFor(subject);
  const hasRecords = markedTotal(subject) > 0;
  const safeColour = recommendation.kind === "SAFE" ? "#18754E" : recommendation.kind === "RISK" ? "#A65D00" : recommendation.kind === "MUST" ? "#A5293A" : "#63718A";
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}><View style={styles.subjectTitleBlock}><Text style={styles.subject}>{subject.subject}</Text><Text style={styles.code}>{subject.subjectCode}</Text></View><View style={styles.percentBlock}><Text style={[styles.percentage, { color: safeColour }]}>{hasRecords ? `${percentage.toFixed(1)}%` : "—"}</Text><Text style={styles.target}>{hasRecords ? "Target 75%" : "Awaiting records"}</Text></View></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${hasRecords ? Math.min(100, percentage) : 0}%`, backgroundColor: safeColour }]} /></View>
      <View style={styles.stats}><View><Text style={styles.statValue}>{subject.present}</Text><Text style={styles.statLabel}>PRESENT</Text></View><View style={styles.divider} /><View><Text style={styles.statValue}>{subject.absent}</Text><Text style={styles.statLabel}>ABSENT</Text></View><View style={styles.divider} /><View><Text style={styles.statValue}>{markedTotal(subject)}</Text><Text style={styles.statLabel}>TOTAL</Text></View></View>
      <View style={styles.recommendationBlock}><RecommendationChip recommendation={recommendation} /><Text style={styles.recommendationDetail}>{recommendation.detail}</Text>{hasRecords ? <View style={styles.projections}><Text style={styles.projection}>If attended <Text style={styles.projectionStrong}>{recommendation.ifAttended.toFixed(1)}%</Text></Text><Text style={styles.projection}>If missed <Text style={[styles.projectionStrong, { color: recommendation.ifMissed >= 75 ? "#18754E" : "#A5293A" }]}>{recommendation.ifMissed.toFixed(1)}%</Text></Text></View> : <Text style={styles.startingNote}>History begins from 10 August 2026.</Text>}</View>
    </View>
  );
}

export default function AttendanceScreen() {
  const { subjects } = useAttendWise();
  const sorted = [...subjects].sort((a, b) => attendancePercentage(a) - attendancePercentage(b));
  return (
    <ScreenContainer>
      <FlatList data={sorted} keyExtractor={(item) => item.subjectId} contentContainerStyle={styles.list} ListHeaderComponent={<><Text style={styles.title}>Attendance</Text><Text style={styles.subtitle}>Per-subject calculations based on your marked lecture occurrences.</Text><View style={styles.formulaCard}><MaterialIcons name="calculate" size={22} color="#2446A8" /><Text style={styles.formulaText}>Recommendations use the exact 75% formula — never a generic “safe” threshold.</Text></View><Text style={styles.listTitle}>Subject insights</Text></>} renderItem={({ item }) => <SubjectCard subject={item} />} ListFooterComponent={<Text style={styles.footnote}>Counts start with labelled sample records and change locally when you mark a session. An authorised official attendance connection is not configured.</Text>} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: "#F7F8FC", padding: 18, paddingBottom: 38 },
  title: { color: "#10213F", fontSize: 28, fontWeight: "800", letterSpacing: -0.8, marginTop: 4 },
  subtitle: { color: "#6D7A94", fontSize: 13, lineHeight: 19, marginTop: 5 },
  formulaCard: { alignItems: "center", backgroundColor: "#E8EDFF", borderRadius: 16, flexDirection: "row", gap: 10, marginTop: 19, padding: 13 },
  formulaText: { color: "#2446A8", flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 17 },
  listTitle: { color: "#10213F", fontSize: 18, fontWeight: "800", marginBottom: 11, marginTop: 22 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 21, borderWidth: 1, marginBottom: 11, overflow: "hidden", padding: 16 },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  subjectTitleBlock: { flex: 1, paddingRight: 8 },
  subject: { color: "#10213F", fontSize: 16, fontWeight: "800" },
  code: { color: "#7A879E", fontSize: 11, marginTop: 3 },
  percentBlock: { alignItems: "flex-end" },
  percentage: { fontSize: 21, fontWeight: "800", letterSpacing: -0.4 },
  target: { color: "#7A879E", fontSize: 10, fontWeight: "700", marginTop: 1 },
  progressTrack: { backgroundColor: "#E8EDF5", borderRadius: 99, height: 7, marginTop: 15, overflow: "hidden", width: "100%" },
  progressFill: { borderRadius: 99, height: 7 },
  stats: { alignItems: "center", flexDirection: "row", gap: 17, marginTop: 14 },
  statValue: { color: "#10213F", fontSize: 16, fontWeight: "800" },
  statLabel: { color: "#7A879E", fontSize: 9, fontWeight: "800", letterSpacing: 0.65, marginTop: 2 },
  divider: { backgroundColor: "#E3E8F3", height: 28, width: 1 },
  recommendationBlock: { borderTopColor: "#E8EDF5", borderTopWidth: 1, marginTop: 14, paddingTop: 13 },
  recommendationDetail: { color: "#52617A", fontSize: 12, lineHeight: 17, marginTop: 7 },
  projections: { flexDirection: "row", gap: 15, marginTop: 9 },
  projection: { color: "#72809A", fontSize: 11 },
  projectionStrong: { color: "#2446A8", fontWeight: "800" },
  startingNote: { color: "#72809A", fontSize: 11, fontWeight: "700", marginTop: 9 },
  footnote: { color: "#7A879E", fontSize: 11, lineHeight: 16, marginTop: 8, textAlign: "center" },
});
