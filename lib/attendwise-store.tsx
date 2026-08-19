import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { INITIAL_SUBJECT_ATTENDANCE, SAMPLE_LECTURES } from "@/lib/sample-timetable";
import type { AttendanceStatus, Lecture, StudentSettings, SubjectAttendance, Subsection, TimetableImport } from "@/lib/attendwise-types";

const STORAGE_KEY = "attendwise-itb-official-v3";
const LEGACY_STORAGE_KEYS = ["attendwise-itb-official-v2", "attendwise-itb-local-v1"];

type PersistedState = {
  settings: StudentSettings;
  subjects: SubjectAttendance[];
  statuses: Record<string, AttendanceStatus>;
  publishedLectures?: Lecture[];
  draftLectures?: Lecture[];
  lastImport?: TimetableImport;
  publishedAt?: string;
};

type AttendWiseContextValue = PersistedState & {
  loading: boolean;
  visibleLectures: (day?: string) => Lecture[];
  completeSetup: (name: string, subsection: Subsection) => void;
  updateSubsection: (subsection: Subsection) => void;
  updateReminderMinutes: (minutes: StudentSettings["reminderMinutes"]) => void;
  markLecture: (lecture: Lecture, status: AttendanceStatus) => void;
  updateDraftLecture: (id: string, update: Partial<Lecture>) => void;
  addDraftLecture: (lecture: Lecture) => void;
  deleteDraftLecture: (id: string) => void;
  recordTimetableImport: (file: Pick<TimetableImport, "fileName" | "mimeType">) => void;
  publishDraft: () => void;
  discardDraft: () => void;
  resetSetup: () => void;
};

const DEFAULT_SETTINGS: StudentSettings = { name: "Student", subsection: "B1", reminderMinutes: 15, setupComplete: false };
const AttendWiseContext = createContext<AttendWiseContextValue | undefined>(undefined);

function cloneSubjects() {
  return INITIAL_SUBJECT_ATTENDANCE.map((subject) => ({ ...subject }));
}

function cloneLectures(lectures: Lecture[]) {
  return lectures.map((lecture) => ({ ...lecture }));
}

function sortLectures(lectures: Lecture[]) {
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return [...lectures].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.startTime.localeCompare(b.startTime));
}

export function AttendWiseProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StudentSettings>(DEFAULT_SETTINGS);
  const [subjects, setSubjects] = useState<SubjectAttendance[]>(cloneSubjects);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [publishedLectures, setPublishedLectures] = useState<Lecture[]>(() => cloneLectures(SAMPLE_LECTURES));
  const [draftLectures, setDraftLectures] = useState<Lecture[]>(() => cloneLectures(SAMPLE_LECTURES));
  const [lastImport, setLastImport] = useState<TimetableImport | undefined>();
  const [publishedAt, setPublishedAt] = useState<string>("2026-08-13T09:12:00");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as PersistedState;
          if (parsed.settings && parsed.subjects && parsed.statuses) {
            setSettings(parsed.settings);
            setSubjects(parsed.subjects);
            setStatuses(parsed.statuses);
            if (parsed.publishedLectures) setPublishedLectures(sortLectures(parsed.publishedLectures));
            if (parsed.draftLectures) setDraftLectures(sortLectures(parsed.draftLectures));
            else if (parsed.publishedLectures) setDraftLectures(sortLectures(parsed.publishedLectures));
            if (parsed.lastImport) setLastImport(parsed.lastImport);
            if (parsed.publishedAt) setPublishedAt(parsed.publishedAt);
          }
          return;
        }

        // Preserve the local profile, but deliberately discard all previous demo attendance values.
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          const legacy = await AsyncStorage.getItem(legacyKey);
          if (!legacy) continue;
          const parsedLegacy = JSON.parse(legacy) as PersistedState;
          if (parsedLegacy.settings?.setupComplete) setSettings(parsedLegacy.settings);
          break;
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, subjects, statuses, publishedLectures, draftLectures, lastImport, publishedAt })).catch(() => undefined);
  }, [loading, settings, subjects, statuses, publishedLectures, draftLectures, lastImport, publishedAt]);

  const visibleLectures = useCallback((day?: string) => {
    return publishedLectures.filter((lecture) => {
      const matchesDay = day ? lecture.day === day : true;
      const matchesSubsection = lecture.group === "COMMON" || lecture.group === settings.subsection;
      return matchesDay && matchesSubsection;
    });
  }, [publishedLectures, settings.subsection]);

  const completeSetup = useCallback((name: string, subsection: Subsection) => {
    setSettings({ ...DEFAULT_SETTINGS, name: name.trim() || "Student", subsection, setupComplete: true });
  }, []);

  const updateSubsection = useCallback((subsection: Subsection) => {
    setSettings((current) => ({ ...current, subsection }));
  }, []);

  const updateReminderMinutes = useCallback((reminderMinutes: StudentSettings["reminderMinutes"]) => {
    setSettings((current) => ({ ...current, reminderMinutes }));
  }, []);

  const markLecture = useCallback((lecture: Lecture, status: AttendanceStatus) => {
    const priorStatus = statuses[lecture.id] ?? "NOT_MARKED";
    if (priorStatus === status) return;
    setSubjects((current) => current.map((subject) => {
      if (subject.subjectId !== lecture.subjectId) return subject;
      const next = { ...subject };
      if (priorStatus === "PRESENT") next.present = Math.max(0, next.present - 1);
      if (priorStatus === "ABSENT") next.absent = Math.max(0, next.absent - 1);
      if (status === "PRESENT") next.present += 1;
      if (status === "ABSENT") next.absent += 1;
      return next;
    }));
    setStatuses((current) => ({ ...current, [lecture.id]: status }));
  }, [statuses]);

  const updateDraftLecture = useCallback((id: string, update: Partial<Lecture>) => {
    setDraftLectures((current) => sortLectures(current.map((lecture) => lecture.id === id ? { ...lecture, ...update } : lecture)));
  }, []);

  const addDraftLecture = useCallback((lecture: Lecture) => {
    setDraftLectures((current) => sortLectures([...current, lecture]));
  }, []);

  const deleteDraftLecture = useCallback((id: string) => {
    setDraftLectures((current) => current.filter((lecture) => lecture.id !== id));
  }, []);

  const recordTimetableImport = useCallback((file: Pick<TimetableImport, "fileName" | "mimeType">) => {
    setLastImport({ ...file, importedAt: new Date().toISOString(), status: "REVIEW_REQUIRED" });
  }, []);

  const publishDraft = useCallback(() => {
    setPublishedLectures(cloneLectures(draftLectures));
    setPublishedAt(new Date().toISOString());
  }, [draftLectures]);

  const discardDraft = useCallback(() => {
    setDraftLectures(cloneLectures(publishedLectures));
    setLastImport(undefined);
  }, [publishedLectures]);

  const resetSetup = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setSubjects(cloneSubjects());
    setStatuses({});
  }, []);

  const value = useMemo(() => ({
    settings, subjects, statuses, publishedLectures, draftLectures, lastImport, publishedAt, loading,
    visibleLectures, completeSetup, updateSubsection, updateReminderMinutes, markLecture,
    updateDraftLecture, addDraftLecture, deleteDraftLecture, recordTimetableImport, publishDraft, discardDraft, resetSetup,
  }), [settings, subjects, statuses, publishedLectures, draftLectures, lastImport, publishedAt, loading, visibleLectures, completeSetup, updateSubsection, updateReminderMinutes, markLecture, updateDraftLecture, addDraftLecture, deleteDraftLecture, recordTimetableImport, publishDraft, discardDraft, resetSetup]);

  return <AttendWiseContext.Provider value={value}>{children}</AttendWiseContext.Provider>;
}

export function useAttendWise() {
  const context = useContext(AttendWiseContext);
  if (!context) throw new Error("useAttendWise must be used within AttendWiseProvider");
  return context;
}
