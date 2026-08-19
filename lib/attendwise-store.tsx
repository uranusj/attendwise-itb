import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { INITIAL_SUBJECT_ATTENDANCE, SAMPLE_LECTURES } from "@/lib/sample-timetable";
import type { AttendanceStatus, Lecture, StudentSettings, SubjectAttendance, Subsection } from "@/lib/attendwise-types";

const STORAGE_KEY = "attendwise-itb-local-v1";

type PersistedState = {
  settings: StudentSettings;
  subjects: SubjectAttendance[];
  statuses: Record<string, AttendanceStatus>;
};

type AttendWiseContextValue = PersistedState & {
  loading: boolean;
  visibleLectures: (day?: string) => Lecture[];
  completeSetup: (name: string, subsection: Subsection) => void;
  updateSubsection: (subsection: Subsection) => void;
  updateReminderMinutes: (minutes: StudentSettings["reminderMinutes"]) => void;
  markLecture: (lecture: Lecture, status: AttendanceStatus) => void;
  resetSetup: () => void;
};

const DEFAULT_SETTINGS: StudentSettings = { name: "Student", subsection: "B1", reminderMinutes: 15, setupComplete: false };
const AttendWiseContext = createContext<AttendWiseContextValue | undefined>(undefined);

function cloneSubjects() {
  return INITIAL_SUBJECT_ATTENDANCE.map((subject) => ({ ...subject }));
}

export function AttendWiseProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StudentSettings>(DEFAULT_SETTINGS);
  const [subjects, setSubjects] = useState<SubjectAttendance[]>(cloneSubjects);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.settings && parsed.subjects && parsed.statuses) {
          setSettings(parsed.settings);
          setSubjects(parsed.subjects);
          setStatuses(parsed.statuses);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, subjects, statuses })).catch(() => undefined);
  }, [loading, settings, subjects, statuses]);

  const visibleLectures = useCallback((day?: string) => {
    return SAMPLE_LECTURES.filter((lecture) => {
      const matchesDay = day ? lecture.day === day : true;
      const matchesSubsection = lecture.group === "COMMON" || lecture.group === settings.subsection;
      return matchesDay && matchesSubsection;
    });
  }, [settings.subsection]);

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

  const resetSetup = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setSubjects(cloneSubjects());
    setStatuses({});
  }, []);

  const value = useMemo(() => ({
    settings,
    subjects,
    statuses,
    loading,
    visibleLectures,
    completeSetup,
    updateSubsection,
    updateReminderMinutes,
    markLecture,
    resetSetup,
  }), [settings, subjects, statuses, loading, visibleLectures, completeSetup, updateSubsection, updateReminderMinutes, markLecture, resetSetup]);

  return <AttendWiseContext.Provider value={value}>{children}</AttendWiseContext.Provider>;
}

export function useAttendWise() {
  const context = useContext(AttendWiseContext);
  if (!context) throw new Error("useAttendWise must be used within AttendWiseProvider");
  return context;
}
