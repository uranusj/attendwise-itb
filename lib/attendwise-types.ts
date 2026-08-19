export type Subsection = "B1" | "B2";
export type LectureGroup = Subsection | "COMMON";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "NOT_MARKED" | "CANCELLED";

export type Lecture = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  subject: string;
  subjectCode: string;
  teacher: string;
  classroom: string;
  group: LectureGroup;
  lectureType: "Lecture" | "Practical" | "Tutorial";
};

export type SubjectAttendance = {
  subjectId: string;
  subject: string;
  subjectCode: string;
  present: number;
  absent: number;
};

/** Stored only in the current app installation; never aggregated with another student. */
export type StudentSettings = {
  name: string;
  subsection: Subsection;
  reminderMinutes: 5 | 10 | 15 | 30;
  setupComplete: boolean;
};

export type TimetableImport = {
  fileName: string;
  mimeType: string;
  importedAt: string;
  status: "REVIEW_REQUIRED";
};

export type Recommendation = {
  kind: "SAFE" | "RISK" | "MUST" | "PENDING";
  label: string;
  detail: string;
  ifAttended: number;
  ifMissed: number;
  canMiss: number;
  requiredToRecover: number;
};
