import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { GroupChip } from "@/components/attendwise-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useAttendWise } from "@/lib/attendwise-store";
import type { Lecture, LectureGroup } from "@/lib/attendwise-types";

type DraftForm = Omit<Lecture, "id" | "subjectId" | "subjectCode">;

const emptyForm: DraftForm = {
  day: "Monday", startTime: "08:30", endTime: "09:30", subject: "", teacher: "", classroom: "", group: "COMMON", lectureType: "Lecture",
};

function formFromLecture(lecture: Lecture): DraftForm {
  const { id: _id, subjectId: _subjectId, subjectCode: _subjectCode, ...form } = lecture;
  return form;
}

export default function AdminScreen() {
  const { draftLectures, lastImport, publishedAt, updateDraftLecture, addDraftLecture, deleteDraftLecture, recordTimetableImport, publishDraft, discardDraft } = useAttendWise();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftForm>(emptyForm);
  const [status, setStatus] = useState("");
  const currentDraftLectures = draftLectures ?? [];

  const editLecture = (lecture: Lecture) => {
    setEditingId(lecture.id);
    setForm(formFromLecture(lecture));
  };

  const startNewLecture = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const updateForm = <K extends keyof DraftForm>(key: K, value: DraftForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const saveForm = () => {
    if (!form.subject.trim() || !form.teacher.trim() || !form.classroom.trim() || !form.day.trim() || !form.startTime.trim() || !form.endTime.trim()) {
      Alert.alert("Complete the class details", "Day, time, subject, teacher, and room are required before the draft can be saved.");
      return;
    }
    const subjectId = form.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "manual-subject";
    if (editingId) {
      updateDraftLecture(editingId, { ...form, subjectId });
      setStatus("Draft class updated. Students will not see it until you publish.");
    } else {
      addDraftLecture({ ...form, id: `manual-${Date.now()}`, subjectId, subjectCode: "Not listed" });
      setStatus("New draft class added. Publish when verified.");
    }
    setEditingId(null);
    setForm(emptyForm);
  };

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf", "text/html", "text/plain"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      recordTimetableImport({ fileName: asset.name, mimeType: asset.mimeType ?? "Unknown file type" });
      setStatus(`“${asset.name}” is marked for review. Verify or edit draft classes before publishing.`);
    } catch {
      setStatus("The file could not be selected. Try saving it from WhatsApp first, then choose it from device storage.");
    }
  };

  const confirmPublish = () => {
    Alert.alert("Publish timetable on this device?", "This replaces the student timetable on this phone with the reviewed draft. It does not combine or change any student’s personal attendance history.", [
      { text: "Cancel", style: "cancel" },
      { text: "Publish", onPress: () => { publishDraft(); setStatus("Published timetable updated on this device. Students can reschedule reminders from Settings."); } },
    ]);
  };

  const confirmDelete = (lecture: Lecture) => {
    Alert.alert("Remove draft class?", `${lecture.subject} will be removed from the draft only. The published timetable remains unchanged until you publish.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => { deleteDraftLecture(lecture.id); setStatus("Draft class removed."); } },
    ]);
  };

  return (
    <ScreenContainer>
      <FlatList
        data={currentDraftLectures}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<>
          <View style={styles.titleRow}><View><Text style={styles.title}>Timetable admin</Text><Text style={styles.subtitle}>Review a local draft before it replaces this device’s student timetable.</Text></View><View style={styles.adminMark}><MaterialIcons name="admin-panel-settings" color="#FFFFFF" size={22} /></View></View>
          <View style={styles.warning}><MaterialIcons name="devices" color="#2446A8" size={19} /><Text style={styles.warningText}>This is a device-local workspace. It does not publish to other students’ phones or merge personal attendance.</Text></View>
          <View style={styles.importCard}><View style={styles.importIcon}><MaterialIcons name="upload-file" size={22} color="#2446A8" /></View><View style={styles.importBody}><Text style={styles.importTitle}>Import from WhatsApp</Text><Text style={styles.importText}>Choose a saved image, PDF, HTML, or text file. It is queued for review; classes are never auto-published.</Text></View></View>
          <Pressable onPress={selectFile} style={({ pressed }) => [styles.importButton, pressed && styles.pressed]}><MaterialIcons name="attach-file" size={18} color="#2446A8" /><Text style={styles.importButtonText}>Select shared timetable file</Text></Pressable>
          {lastImport ? <View style={styles.reviewState}><MaterialIcons name="pending-actions" size={18} color="#A65D00" /><View style={styles.reviewBody}><Text style={styles.reviewTitle}>Review required</Text><Text style={styles.reviewText}>{lastImport.fileName} · {lastImport.mimeType}</Text></View></View> : null}
          {status ? <Text style={styles.status}>{status}</Text> : null}
          <View style={styles.draftHeader}><View><Text style={styles.sectionTitle}>Working draft</Text><Text style={styles.sectionDetail}>{currentDraftLectures.length} class sessions · published {publishedAt ? new Date(publishedAt).toLocaleDateString("en-GB") : "not yet"}</Text></View><Pressable onPress={startNewLecture} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><MaterialIcons name="add" size={18} color="#FFFFFF" /><Text style={styles.addButtonText}>Add class</Text></Pressable></View>
          <View style={styles.editorCard}><Text style={styles.editorTitle}>{editingId ? "Edit selected class" : "Add a verified class"}</Text><Text style={styles.editorDetail}>Use the class details from the official timetable or the reviewed WhatsApp update.</Text><View style={styles.inputRow}><Input label="DAY" value={form.day} onChangeText={(value) => updateForm("day", value)} wide /><Input label="START" value={form.startTime} onChangeText={(value) => updateForm("startTime", value)} /><Input label="END" value={form.endTime} onChangeText={(value) => updateForm("endTime", value)} /></View><Input label="SUBJECT" value={form.subject} onChangeText={(value) => updateForm("subject", value)} /><Input label="TEACHER" value={form.teacher} onChangeText={(value) => updateForm("teacher", value)} /><Input label="ROOM / LAB" value={form.classroom} onChangeText={(value) => updateForm("classroom", value)} /><Text style={styles.inputLabel}>APPLIES TO</Text><View style={styles.groupRow}>{(["COMMON", "B1", "B2"] as LectureGroup[]).map((group) => <Pressable key={group} onPress={() => updateForm("group", group)} style={({ pressed }) => [styles.groupButton, form.group === group && styles.groupButtonSelected, pressed && styles.pressed]}><Text style={[styles.groupButtonText, form.group === group && styles.groupButtonTextSelected]}>{group === "COMMON" ? "Common ITB" : group}</Text></Pressable>)}</View><Text style={styles.inputLabel}>CLASS TYPE</Text><View style={styles.groupRow}>{(["Lecture", "Practical", "Tutorial"] as Lecture["lectureType"][]).map((type) => <Pressable key={type} onPress={() => updateForm("lectureType", type)} style={({ pressed }) => [styles.groupButton, form.lectureType === type && styles.groupButtonSelected, pressed && styles.pressed]}><Text style={[styles.groupButtonText, form.lectureType === type && styles.groupButtonTextSelected]}>{type}</Text></Pressable>)}</View><View style={styles.editorActions}>{editingId ? <Pressable onPress={() => { setEditingId(null); setForm(emptyForm); }} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}><Text style={styles.cancelText}>Cancel</Text></Pressable> : null}<Pressable onPress={saveForm} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><Text style={styles.saveText}>{editingId ? "Save draft changes" : "Add to draft"}</Text><MaterialIcons name="check" size={17} color="#FFFFFF" /></Pressable></View></View>
        </>}
        renderItem={({ item }) => <View style={styles.classCard}><View style={styles.classTime}><Text style={styles.classStart}>{item.startTime}</Text><Text style={styles.classEnd}>{item.endTime}</Text></View><View style={styles.classBody}><View style={styles.classTop}><Text style={styles.classSubject}>{item.subject}</Text><GroupChip group={item.group} /></View><Text style={styles.classMeta}>{item.day} · {item.lectureType} · {item.classroom}</Text><Text style={styles.classTeacher}>{item.teacher}</Text><View style={styles.classActions}><Pressable onPress={() => editLecture(item)} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}><MaterialIcons name="edit" size={15} color="#2446A8" /><Text style={styles.editText}>Edit</Text></Pressable><Pressable onPress={() => confirmDelete(item)} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={16} color="#A5293A" /></Pressable></View></View></View>}
        ListFooterComponent={<View style={styles.publishArea}><View style={styles.publishSummary}><MaterialIcons name="publish" size={21} color="#2446A8" /><View style={styles.publishBody}><Text style={styles.publishTitle}>Ready to publish?</Text><Text style={styles.publishText}>Only verified edits from this draft will replace the timetable shown to students on this phone.</Text></View></View><View style={styles.publishRow}><Pressable onPress={() => { discardDraft(); setStatus("Draft discarded. The published timetable remains unchanged."); }} style={({ pressed }) => [styles.discardButton, pressed && styles.pressed]}><Text style={styles.discardText}>Discard draft</Text></Pressable><Pressable onPress={confirmPublish} style={({ pressed }) => [styles.publishButton, pressed && styles.pressed]}><Text style={styles.publishButtonText}>Publish timetable</Text><MaterialIcons name="check-circle" size={18} color="#FFFFFF" /></Pressable></View></View>}
      />
    </ScreenContainer>
  );
}

function Input({ label, value, onChangeText, wide = false }: { label: string; value: string; onChangeText: (value: string) => void; wide?: boolean }) {
  return <View style={[styles.inputWrap, wide && styles.inputWide]}><Text style={styles.inputLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} style={styles.input} placeholderTextColor="#9AA5B8" /></View>;
}

const styles = StyleSheet.create({
  list: { backgroundColor: "#F7F8FC", padding: 18, paddingBottom: 38 },
  titleRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  title: { color: "#10213F", fontSize: 27, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { color: "#6D7A94", fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 285 },
  adminMark: { alignItems: "center", backgroundColor: "#10213F", borderRadius: 14, height: 43, justifyContent: "center", width: 43 },
  warning: { alignItems: "flex-start", backgroundColor: "#E8EDFF", borderRadius: 15, flexDirection: "row", gap: 9, marginTop: 17, padding: 13 },
  warningText: { color: "#2446A8", flex: 1, fontSize: 11, fontWeight: "700", lineHeight: 16 },
  importCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 11, marginTop: 18, padding: 14 },
  importIcon: { alignItems: "center", backgroundColor: "#E8EDFF", borderRadius: 12, height: 42, justifyContent: "center", width: 42 },
  importBody: { flex: 1 },
  importTitle: { color: "#10213F", fontSize: 14, fontWeight: "800" },
  importText: { color: "#6D7A94", fontSize: 11, lineHeight: 16, marginTop: 3 },
  importButton: { alignItems: "center", borderColor: "#2446A8", borderRadius: 11, borderWidth: 1, flexDirection: "row", gap: 7, justifyContent: "center", marginTop: 10, paddingVertical: 11 },
  importButtonText: { color: "#2446A8", fontSize: 12, fontWeight: "800" },
  reviewState: { alignItems: "center", backgroundColor: "#FFF0D4", borderRadius: 13, flexDirection: "row", gap: 9, marginTop: 10, padding: 11 },
  reviewBody: { flex: 1 },
  reviewTitle: { color: "#A65D00", fontSize: 12, fontWeight: "800" },
  reviewText: { color: "#835B24", fontSize: 10, marginTop: 2 },
  status: { color: "#2446A8", fontSize: 11, fontWeight: "700", lineHeight: 16, marginTop: 9 },
  draftHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 11, marginTop: 22 },
  sectionTitle: { color: "#10213F", fontSize: 18, fontWeight: "800" },
  sectionDetail: { color: "#7A879E", fontSize: 10, marginTop: 3 },
  addButton: { alignItems: "center", backgroundColor: "#2446A8", borderRadius: 10, flexDirection: "row", gap: 3, paddingHorizontal: 11, paddingVertical: 9 },
  addButtonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  editorCard: { backgroundColor: "#FFFFFF", borderColor: "#D5DDF0", borderRadius: 19, borderWidth: 1, marginBottom: 12, padding: 14 },
  editorTitle: { color: "#10213F", fontSize: 15, fontWeight: "800" },
  editorDetail: { color: "#6D7A94", fontSize: 11, lineHeight: 16, marginTop: 3 },
  inputRow: { flexDirection: "row", gap: 8 },
  inputWrap: { flex: 1, marginTop: 12 },
  inputWide: { flex: 1.7 },
  inputLabel: { color: "#71809A", fontSize: 9, fontWeight: "800", letterSpacing: 0.7, marginTop: 12 },
  input: { backgroundColor: "#F7F8FC", borderColor: "#E0E6F0", borderRadius: 9, borderWidth: 1, color: "#10213F", fontSize: 12, fontWeight: "600", marginTop: 5, paddingHorizontal: 9, paddingVertical: 9 },
  groupRow: { flexDirection: "row", gap: 7, marginTop: 6 },
  groupButton: { alignItems: "center", backgroundColor: "#F7F8FC", borderColor: "#E0E6F0", borderRadius: 8, borderWidth: 1, flex: 1, paddingVertical: 8 },
  groupButtonSelected: { backgroundColor: "#E8EDFF", borderColor: "#2446A8" },
  groupButtonText: { color: "#72809A", fontSize: 10, fontWeight: "800" },
  groupButtonTextSelected: { color: "#2446A8" },
  editorActions: { alignItems: "center", flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  cancelButton: { marginRight: 15, padding: 9 },
  cancelText: { color: "#6D7A94", fontSize: 12, fontWeight: "800" },
  saveButton: { alignItems: "center", backgroundColor: "#2446A8", borderRadius: 10, flexDirection: "row", gap: 5, paddingHorizontal: 13, paddingVertical: 10 },
  saveText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  classCard: { backgroundColor: "#FFFFFF", borderColor: "#E3E8F3", borderRadius: 17, borderWidth: 1, flexDirection: "row", marginBottom: 9, padding: 12 },
  classTime: { borderRightColor: "#E3E8F3", borderRightWidth: 1, paddingRight: 9, width: 56 },
  classStart: { color: "#10213F", fontSize: 11, fontWeight: "800" },
  classEnd: { color: "#7A879E", fontSize: 10, marginTop: 3 },
  classBody: { flex: 1, marginLeft: 11 },
  classTop: { alignItems: "flex-start", flexDirection: "row", gap: 7, justifyContent: "space-between" },
  classSubject: { color: "#10213F", flex: 1, fontSize: 13, fontWeight: "800" },
  classMeta: { color: "#6D7A94", fontSize: 10, marginTop: 4 },
  classTeacher: { color: "#52617A", fontSize: 10, marginTop: 3 },
  classActions: { flexDirection: "row", gap: 7, marginTop: 10 },
  editButton: { alignItems: "center", backgroundColor: "#E8EDFF", borderRadius: 8, flexDirection: "row", gap: 4, paddingHorizontal: 9, paddingVertical: 6 },
  editText: { color: "#2446A8", fontSize: 10, fontWeight: "800" },
  deleteButton: { alignItems: "center", backgroundColor: "#FFF1F2", borderRadius: 8, justifyContent: "center", paddingHorizontal: 8 },
  publishArea: { backgroundColor: "#10213F", borderRadius: 20, marginTop: 14, padding: 15 },
  publishSummary: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  publishBody: { flex: 1 },
  publishTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  publishText: { color: "#C8D4F7", fontSize: 11, lineHeight: 16, marginTop: 3 },
  publishRow: { flexDirection: "row", gap: 10, marginTop: 15 },
  discardButton: { alignItems: "center", borderColor: "#6A7EB3", borderRadius: 10, borderWidth: 1, flex: 1, justifyContent: "center", paddingVertical: 11 },
  discardText: { color: "#D2DDF8", fontSize: 11, fontWeight: "800" },
  publishButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 10, flex: 1.4, flexDirection: "row", gap: 5, justifyContent: "center", paddingVertical: 11 },
  publishButtonText: { color: "#10213F", fontSize: 11, fontWeight: "800" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.985 }] },
});
