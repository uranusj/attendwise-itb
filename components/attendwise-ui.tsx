import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { LectureGroup, Recommendation } from "@/lib/attendwise-types";

const GROUP_STYLE: Record<LectureGroup, { background: string; ink: string; label: string }> = {
  COMMON: { background: "#D7F2F4", ink: "#086875", label: "COMMON ITB" },
  B1: { background: "#ECE6FF", ink: "#5937AE", label: "ITB • B1" },
  B2: { background: "#FFF0D4", ink: "#9A5900", label: "ITB • B2" },
};

const RECOMMENDATION_STYLE: Record<Recommendation["kind"], { background: string; ink: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  SAFE: { background: "#E2F5EC", ink: "#18754E", icon: "check-circle" },
  RISK: { background: "#FFF0D4", ink: "#A65D00", icon: "error-outline" },
  MUST: { background: "#FCE5E8", ink: "#A5293A", icon: "priority-high" },
};

export function GroupChip({ group }: { group: LectureGroup }) {
  const style = GROUP_STYLE[group];
  return <View style={[styles.chip, { backgroundColor: style.background }]}><Text style={[styles.chipText, { color: style.ink }]}>{style.label}</Text></View>;
}

export function RecommendationChip({ recommendation }: { recommendation: Recommendation }) {
  const style = RECOMMENDATION_STYLE[recommendation.kind];
  return (
    <View style={[styles.recommendation, { backgroundColor: style.background }]}>
      <MaterialIcons name={style.icon} size={15} color={style.ink} />
      <Text style={[styles.recommendationText, { color: style.ink }]}>{recommendation.label}</Text>
    </View>
  );
}

export function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.headingRow}>
      <Text style={styles.heading}>{title}</Text>
      {action && onAction ? <Pressable onPress={onAction} style={({ pressed }) => [styles.headingAction, pressed && styles.pressed]}><Text style={styles.headingActionText}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function EmptyState({ icon, title, detail }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; detail: string }) {
  return <View style={styles.empty}><MaterialIcons name={icon} size={28} color="#6D7A94" /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDetail}>{detail}</Text></View>;
}

const styles = StyleSheet.create({
  chip: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  chipText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.55 },
  recommendation: { flexDirection: "row", gap: 5, alignItems: "center", alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  recommendationText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.35 },
  headingRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10, marginTop: 4 },
  heading: { color: "#10213F", fontSize: 20, fontWeight: "800", letterSpacing: -0.25 },
  headingAction: { paddingHorizontal: 3, paddingVertical: 6 },
  headingActionText: { color: "#2446A8", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.68 },
  empty: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 20, borderWidth: 1, padding: 26 },
  emptyTitle: { color: "#10213F", fontSize: 16, fontWeight: "800", marginTop: 10 },
  emptyDetail: { color: "#6D7A94", fontSize: 13, lineHeight: 19, marginTop: 4, textAlign: "center" },
});
