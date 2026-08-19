import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { GroupChip } from "@/components/attendwise-ui";
import { ScreenContainer } from "@/components/screen-container";
import { dateFromKey, dateKey, displayDate, isWeekend, isWithinAttendanceRange, monthGrid } from "@/lib/attendance-calendar";
import { useAttendWise } from "@/lib/attendwise-store";
import type { AttendanceStatus, Lecture } from "@/lib/attendwise-types";
import { useColors } from "@/hooks/use-colors";

const MONTHS = ["August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function DateLectureCard({ lecture, status, disabled, onStatus }: { lecture: Lecture; status: AttendanceStatus; disabled: boolean; onStatus: (status: AttendanceStatus) => void }) {
  return <View style={styles.lectureCard}><View style={styles.lectureTime}><Text style={styles.lectureStart}>{lecture.startTime}</Text><Text style={styles.lectureEnd}>{lecture.endTime}</Text></View><View style={styles.lectureBody}><View style={styles.lectureTop}><Text style={styles.lectureSubject}>{lecture.subject}</Text><GroupChip group={lecture.group} /></View><Text style={styles.lectureDetail}>{lecture.classroom} · {lecture.lectureType}</Text><Text style={styles.lectureTeacher}>{lecture.teacher}</Text>{disabled ? <Text style={styles.futureNote}>Attendance can be marked after this date.</Text> : <View style={styles.markRow}><StatusButton label="Present" selected={status === "PRESENT"} color="#18754E" onPress={() => onStatus("PRESENT")} /><StatusButton label="Absent" selected={status === "ABSENT"} color="#A5293A" onPress={() => onStatus("ABSENT")} /><StatusButton label="Cancelled" selected={status === "CANCELLED"} color="#6D7A94" onPress={() => onStatus("CANCELLED")} /></View>}</View></View>;
}

function StatusButton({ label, selected, color, onPress }: { label: string; selected: boolean; color: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.statusButton, selected && { backgroundColor: color, borderColor: color }, pressed && styles.pressed]}><Text style={[styles.statusText, selected && styles.statusTextSelected]}>{label}</Text></Pressable>;
}

export default function DatesScreen() {
  const { settings, visibleLectures, getLectureStatus, markLecture } = useAttendWise();
  const colors = useColors();
  const [monthIndex, setMonthIndex] = useState(7);
  const [selectedKey, setSelectedKey] = useState("2026-08-12");
  const selectedDate = dateFromKey(selectedKey);
  const selectedDay = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  const isHoliday = isWeekend(selectedDate);
  const nowKey = dateKey(new Date());
  const isFuture = selectedKey > nowKey;
  const lectures = isHoliday ? [] : visibleLectures(selectedDay);
  const cells = useMemo(() => monthGrid(2026, monthIndex), [monthIndex]);

  return <ScreenContainer><FlatList
    data={lectures}
    keyExtractor={(item) => item.id}
    contentContainerStyle={[styles.list, { backgroundColor: colors.background }]}
    ListHeaderComponent={<>
      <Text style={styles.title}>Attendance dates</Text><Text style={styles.subtitle}>ITB — {settings.subsection} · 12 Aug to 31 Dec 2026</Text>
      <View style={styles.monthNavigation}><Pressable disabled={monthIndex === 7} onPress={() => setMonthIndex((value) => value - 1)} style={({ pressed }) => [styles.monthButton, monthIndex === 7 && styles.disabled, pressed && styles.pressed]}><MaterialIcons name="chevron-left" color="#0A7EA4" size={22} /></Pressable><Text style={styles.monthTitle}>{MONTHS[monthIndex - 7]} 2026</Text><Pressable disabled={monthIndex === 11} onPress={() => setMonthIndex((value) => value + 1)} style={({ pressed }) => [styles.monthButton, monthIndex === 11 && styles.disabled, pressed && styles.pressed]}><MaterialIcons name="chevron-right" color="#0A7EA4" size={22} /></Pressable></View>
      <View style={styles.calendarCard}><View style={styles.weekHeader}>{WEEKDAYS.map((weekday) => <Text key={weekday} style={[styles.weekday, weekday === "Sun" || weekday === "Sat" ? styles.weekendWeekday : null]}>{weekday}</Text>)}</View><View style={styles.grid}>{cells.map((date, index) => { if (!date) return <View key={`blank-${index}`} style={styles.dayCell} />; const inRange = isWithinAttendanceRange(date); const weekend = isWeekend(date); const selected = dateKey(date) === selectedKey; return <Pressable key={dateKey(date)} disabled={!inRange} onPress={() => setSelectedKey(dateKey(date))} style={({ pressed }) => [styles.dayCell, selected && styles.selectedDay, weekend && inRange && styles.holidayDay, !inRange && styles.outOfRange, pressed && styles.pressed]}><Text style={[styles.dayNumber, selected && styles.selectedDayText, weekend && inRange && !selected && styles.holidayText, !inRange && styles.outOfRangeText]}>{date.getDate()}</Text>{weekend && inRange ? <View style={[styles.holidayDot, selected && styles.selectedHolidayDot]} /> : null}</Pressable>; })}</View></View>
      <View style={[styles.selectedCard, isHoliday && styles.selectedHolidayCard]}><View style={styles.selectedIcon}><MaterialIcons name={isHoliday ? "beach-access" : "event-note"} size={21} color={isHoliday ? "#A65D00" : "#0A7EA4"} /></View><View style={styles.selectedBody}><Text style={styles.selectedLabel}>{isHoliday ? "WEEKEND HOLIDAY" : "SELECTED DATE"}</Text><Text style={styles.selectedTitle}>{displayDate(selectedDate)}</Text><Text style={styles.selectedDetail}>{isHoliday ? "Saturday and Sunday are marked as holidays. No lectures or attendance are scheduled." : isFuture ? "Future date — timetable is visible; attendance stays unmarked until class." : "Mark each scheduled lecture separately for this date."}</Text></View></View>
      {!isHoliday && <Text style={styles.scheduleTitle}>{lectures.length ? "Scheduled lectures" : "No lecture scheduled"}</Text>}
    </>}
    renderItem={({ item }) => <DateLectureCard lecture={item} status={getLectureStatus(item, selectedKey)} disabled={isFuture} onStatus={(status) => markLecture(item, status, selectedKey)} />}
    ListEmptyComponent={isHoliday ? <View style={styles.holidayEmpty}><MaterialIcons name="weekend" size={26} color="#A65D00" /><Text style={styles.holidayEmptyTitle}>Holiday</Text><Text style={styles.holidayEmptyText}>No attendance can be recorded on Saturdays or Sundays.</Text></View> : <View style={styles.empty}><MaterialIcons name="event-available" size={26} color="#6D7A94" /><Text style={styles.emptyTitle}>No ITB lecture on this date</Text><Text style={styles.emptyText}>There are no sessions for your selected subsection on this weekday.</Text></View>}
    ListFooterComponent={<Text style={styles.footnote}>Attendance data is stored only in this student profile on this phone.</Text>}
  /></ScreenContainer>;
}

const styles = StyleSheet.create({
  list: { backgroundColor: "#FFFFFF", padding: 18, paddingBottom: 38 },
  title: { color: "#10213F", fontSize: 28, fontWeight: "800", letterSpacing: -0.8, marginTop: 4 },
  subtitle: { color: "#6D7A94", fontSize: 12, marginTop: 5 },
  monthNavigation: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  monthButton: { alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 11, height: 38, justifyContent: "center", width: 38 },
  disabled: { opacity: 0.35 },
  monthTitle: { color: "#10213F", fontSize: 17, fontWeight: "800" },
  calendarCard: { backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 19, borderWidth: 1, marginTop: 12, padding: 11 },
  weekHeader: { flexDirection: "row", marginBottom: 6 },
  weekday: { color: "#71809A", flex: 1, fontSize: 10, fontWeight: "800", textAlign: "center" },
  weekendWeekday: { color: "#A65D00" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { alignItems: "center", borderRadius: 10, height: 40, justifyContent: "center", marginVertical: 1, width: "14.2857%" },
  dayNumber: { color: "#10213F", fontSize: 12, fontWeight: "700" },
  selectedDay: { backgroundColor: "#0A7EA4" },
  selectedDayText: { color: "#FFFFFF" },
  holidayDay: { backgroundColor: "#FFF3E0" },
  holidayText: { color: "#A65D00" },
  holidayDot: { backgroundColor: "#D98B21", borderRadius: 99, bottom: 5, height: 3, position: "absolute", width: 3 },
  selectedHolidayDot: { backgroundColor: "#FFFFFF" },
  outOfRange: { opacity: 0.25 },
  outOfRangeText: { color: "#9CA7B9" },
  selectedCard: { alignItems: "flex-start", backgroundColor: "#F9FAFB", borderRadius: 17, flexDirection: "row", gap: 10, marginTop: 13, padding: 13 },
  selectedHolidayCard: { backgroundColor: "#FFF3E0" },
  selectedIcon: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12, height: 40, justifyContent: "center", width: 40 },
  selectedBody: { flex: 1 },
  selectedLabel: { color: "#0A7EA4", fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  selectedTitle: { color: "#10213F", fontSize: 14, fontWeight: "800", marginTop: 2 },
  selectedDetail: { color: "#52617A", fontSize: 11, lineHeight: 16, marginTop: 3 },
  scheduleTitle: { color: "#10213F", fontSize: 17, fontWeight: "800", marginBottom: 11, marginTop: 21 },
  lectureCard: { backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 18, borderWidth: 1, flexDirection: "row", marginBottom: 9, padding: 13 },
  lectureTime: { borderRightColor: "#E3E8F3", borderRightWidth: 1, paddingRight: 10, width: 56 },
  lectureStart: { color: "#10213F", fontSize: 11, fontWeight: "800" },
  lectureEnd: { color: "#71809A", fontSize: 10, marginTop: 3 },
  lectureBody: { flex: 1, marginLeft: 10 },
  lectureTop: { alignItems: "flex-start", flexDirection: "row", gap: 6, justifyContent: "space-between" },
  lectureSubject: { color: "#10213F", flex: 1, fontSize: 14, fontWeight: "800" },
  lectureDetail: { color: "#6D7A94", fontSize: 10, marginTop: 4 },
  lectureTeacher: { color: "#52617A", fontSize: 10, marginTop: 3 },
  markRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  statusButton: { backgroundColor: "#F6F8FB", borderColor: "#E1E6EF", borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 6 },
  statusText: { color: "#6D7A94", fontSize: 9, fontWeight: "800" },
  statusTextSelected: { color: "#FFFFFF" },
  futureNote: { color: "#71809A", fontSize: 10, fontStyle: "italic", marginTop: 10 },
  holidayEmpty: { alignItems: "center", backgroundColor: "#FFF3E0", borderRadius: 18, padding: 25 },
  holidayEmptyTitle: { color: "#A65D00", fontSize: 16, fontWeight: "800", marginTop: 8 },
  holidayEmptyText: { color: "#805B27", fontSize: 11, marginTop: 4, textAlign: "center" },
  empty: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 18, borderWidth: 1, padding: 25 },
  emptyTitle: { color: "#10213F", fontSize: 15, fontWeight: "800", marginTop: 8 },
  emptyText: { color: "#6D7A94", fontSize: 11, marginTop: 4, textAlign: "center" },
  footnote: { color: "#7A879E", fontSize: 10, marginTop: 16, textAlign: "center" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.98 }] },
});
