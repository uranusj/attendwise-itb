import type { Lecture, SubjectAttendance } from "@/lib/attendwise-types";

/**
 * Verified from the public GNDEC ITB1 and ITB2 timetable tables.
 * This recurring timetable is effective from 10 August 2026. Subject codes were
 * not listed in the source, so the app intentionally does not invent them.
 */
export const TIMETABLE_EFFECTIVE_FROM = "10 August 2026";
export const TIMETABLE_SOURCE_LABEL = "GNDEC public ITB1 / ITB2 timetable";

const lecture = (
  id: string,
  day: string,
  startTime: string,
  endTime: string,
  subjectId: string,
  subject: string,
  teacher: string,
  classroom: string,
  group: Lecture["group"],
  lectureType: Lecture["lectureType"],
): Lecture => ({ id, day, startTime, endTime, subjectId, subject, subjectCode: "Not listed", teacher, classroom, group, lectureType });

export const SAMPLE_LECTURES: Lecture[] = [
  lecture("mon-0830-chem", "Monday", "08:30", "09:30", "chemistry", "Chemistry", "Dr Amandeep Kaur", "S205", "COMMON", "Lecture"),
  lecture("mon-0930-beee", "Monday", "09:30", "10:30", "beee", "Basic Electrical and Electronics Engineering", "Er. Mani Bansal (EE)", "S205", "COMMON", "Lecture"),
  lecture("mon-1030-english", "Monday", "10:30", "11:30", "english", "Professional English Communication", "Manpreet Kaur", "S205", "COMMON", "Lecture"),
  lecture("mon-1230-math", "Monday", "12:30", "13:30", "math", "Math I", "Sukhminder Singh", "S205", "COMMON", "Lecture"),
  lecture("mon-1330-programming-b1", "Monday", "13:30", "15:30", "programming", "Programming for Problem Solving", "FAC 6 (IT)", "OS1 Lab, IT Department", "B1", "Practical"),
  lecture("mon-1330-math-b2", "Monday", "13:30", "14:30", "math", "Math I", "Sukhminder Singh", "S205", "B2", "Tutorial"),

  lecture("tue-0930-chem", "Tuesday", "09:30", "10:30", "chemistry", "Chemistry", "Dr Amandeep Kaur", "F112", "COMMON", "Lecture"),
  lecture("tue-1030-beee", "Tuesday", "10:30", "11:30", "beee", "Basic Electrical and Electronics Engineering", "Er. Mani Bansal (EE)", "F112", "COMMON", "Lecture"),
  lecture("tue-1130-english", "Tuesday", "11:30", "12:30", "english", "Professional English Communication", "Manpreet Kaur", "F112", "COMMON", "Lecture"),
  lecture("tue-1330-beee-b1", "Tuesday", "13:30", "15:30", "beee", "Basic Electrical and Electronics Engineering", "Er. Ranjit Singh (EE)", "BEE Lab 1", "B1", "Practical"),
  lecture("tue-1330-programming-b2", "Tuesday", "13:30", "15:30", "programming", "Programming for Problem Solving", "FAC 6 (IT)", "OS1 Lab, IT Department", "B2", "Practical"),

  lecture("wed-0930-beee", "Wednesday", "09:30", "10:30", "beee", "Basic Electrical and Electronics Engineering", "Er. Mani Bansal (EE)", "F108", "COMMON", "Lecture"),
  lecture("wed-1030-chem", "Wednesday", "10:30", "11:30", "chemistry", "Chemistry", "Dr Amandeep Kaur", "F108", "COMMON", "Lecture"),
  lecture("wed-1230-programming-b1", "Wednesday", "12:30", "14:30", "programming", "Programming for Problem Solving", "FAC 6 (IT)", "OS1 Lab, IT Department", "B1", "Practical"),
  lecture("wed-1230-chem-b2", "Wednesday", "12:30", "14:30", "chemistry", "Chemistry", "Karan Bhalla, Mandeep Kaur", "Chem Lab 1", "B2", "Practical"),
  lecture("wed-1330-math", "Wednesday", "13:30", "14:30", "math", "Math I", "Sukhminder Singh", "S205", "COMMON", "Lecture"),
  lecture("wed-1430-english", "Wednesday", "14:30", "15:30", "english", "Professional English Communication", "Manpreet Kaur", "F108", "COMMON", "Lecture"),

  lecture("thu-1030-english-b1", "Thursday", "10:30", "12:30", "english", "Professional English Communication", "Aastik Sharma", "ENG Lab", "B1", "Practical"),
  lecture("thu-1030-beee-b2", "Thursday", "10:30", "12:30", "beee", "Basic Electrical and Electronics Engineering", "Er. Swapandeep Kaur (EE)", "PE Lab (BEE Lab 2)", "B2", "Practical"),
  lecture("thu-1330-math", "Thursday", "13:30", "14:30", "math", "Math I", "Sukhminder Singh", "S205", "COMMON", "Lecture"),

  lecture("fri-0930-chem-b1", "Friday", "09:30", "11:30", "chemistry", "Chemistry", "Mandeep Kaur, Karan Bhalla", "Chem Lab 1", "B1", "Practical"),
  lecture("fri-0930-programming-b2", "Friday", "09:30", "11:30", "programming", "Programming for Problem Solving", "FAC 6 (IT)", "PL1 Lab, IT Department", "B2", "Practical"),
  lecture("fri-1230-math", "Friday", "12:30", "13:30", "math", "Math I", "Sukhminder Singh", "F112", "COMMON", "Lecture"),
  lecture("fri-1330-math-b1", "Friday", "13:30", "14:30", "math", "Math I", "Sukhminder Singh", "F112", "B1", "Tutorial"),
  lecture("fri-1430-beee-b1", "Friday", "14:30", "15:30", "beee", "Basic Electrical and Electronics Engineering", "Er. Mani Bansal (EE)", "F112", "B1", "Tutorial"),
  lecture("fri-1330-english-b2", "Friday", "13:30", "15:30", "english", "Professional English Communication", "Aastik Sharma", "ENG Lab", "B2", "Practical"),
  lecture("fri-1530-beee-b2", "Friday", "15:30", "16:30", "beee", "Basic Electrical and Electronics Engineering", "Er. Mani Bansal (EE)", "F113", "B2", "Tutorial"),
];

export const INITIAL_SUBJECT_ATTENDANCE: SubjectAttendance[] = [
  { subjectId: "chemistry", subject: "Chemistry", subjectCode: "Not listed", present: 0, absent: 0 },
  { subjectId: "beee", subject: "Basic Electrical and Electronics Engineering", subjectCode: "Not listed", present: 0, absent: 0 },
  { subjectId: "english", subject: "Professional English Communication", subjectCode: "Not listed", present: 0, absent: 0 },
  { subjectId: "math", subject: "Math I", subjectCode: "Not listed", present: 0, absent: 0 },
  { subjectId: "programming", subject: "Programming for Problem Solving", subjectCode: "Not listed", present: 0, absent: 0 },
];

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
