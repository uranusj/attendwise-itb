import type { Lecture, SubjectAttendance } from "@/lib/attendwise-types";

/**
 * Local demonstration data. It follows the separate ITB1/ITB2 structure
 * identified in the public GNDEC source notes and is not a production timetable.
 */
export const SAMPLE_LECTURES: Lecture[] = [
  { id: "mon-math", day: "Monday", startTime: "09:00", endTime: "10:00", subjectId: "math", subject: "Engineering Mathematics", subjectCode: "BTM101", teacher: "Dr. K. Sharma", classroom: "Room 204", group: "COMMON", lectureType: "Lecture" },
  { id: "mon-physics-b1", day: "Monday", startTime: "10:00", endTime: "11:00", subjectId: "physics", subject: "Applied Physics", subjectCode: "BTP102", teacher: "Dr. S. Kaur", classroom: "Physics Lab 2", group: "B1", lectureType: "Practical" },
  { id: "mon-program-b2", day: "Monday", startTime: "10:00", endTime: "11:00", subjectId: "programming", subject: "Programming Fundamentals", subjectCode: "BTI103", teacher: "Mr. A. Singh", classroom: "Lab 3", group: "B2", lectureType: "Practical" },
  { id: "mon-chem", day: "Monday", startTime: "12:00", endTime: "13:00", subjectId: "chemistry", subject: "Applied Chemistry", subjectCode: "BTC104", teacher: "Dr. P. Gill", classroom: "Room 301", group: "COMMON", lectureType: "Lecture" },
  { id: "tue-program", day: "Tuesday", startTime: "09:00", endTime: "10:00", subjectId: "programming", subject: "Programming Fundamentals", subjectCode: "BTI103", teacher: "Mr. A. Singh", classroom: "Lab 2", group: "COMMON", lectureType: "Lecture" },
  { id: "tue-english-b1", day: "Tuesday", startTime: "11:00", endTime: "12:00", subjectId: "communication", subject: "Communication Skills", subjectCode: "BTH105", teacher: "Ms. R. Mehta", classroom: "Room 113", group: "B1", lectureType: "Tutorial" },
  { id: "tue-physics-b2", day: "Tuesday", startTime: "11:00", endTime: "12:00", subjectId: "physics", subject: "Applied Physics", subjectCode: "BTP102", teacher: "Dr. S. Kaur", classroom: "Physics Lab 1", group: "B2", lectureType: "Practical" },
  { id: "wed-math", day: "Wednesday", startTime: "09:00", endTime: "10:00", subjectId: "math", subject: "Engineering Mathematics", subjectCode: "BTM101", teacher: "Dr. K. Sharma", classroom: "Room 204", group: "COMMON", lectureType: "Lecture" },
  { id: "wed-chem-b1", day: "Wednesday", startTime: "10:00", endTime: "12:00", subjectId: "chemistry", subject: "Applied Chemistry", subjectCode: "BTC104", teacher: "Dr. P. Gill", classroom: "Chemistry Lab 1", group: "B1", lectureType: "Practical" },
  { id: "wed-program-b2", day: "Wednesday", startTime: "10:00", endTime: "12:00", subjectId: "programming", subject: "Programming Fundamentals", subjectCode: "BTI103", teacher: "Mr. A. Singh", classroom: "Lab 3", group: "B2", lectureType: "Practical" },
  { id: "thu-physics", day: "Thursday", startTime: "09:00", endTime: "10:00", subjectId: "physics", subject: "Applied Physics", subjectCode: "BTP102", teacher: "Dr. S. Kaur", classroom: "Room 301", group: "COMMON", lectureType: "Lecture" },
  { id: "thu-comm-b2", day: "Thursday", startTime: "10:00", endTime: "11:00", subjectId: "communication", subject: "Communication Skills", subjectCode: "BTH105", teacher: "Ms. R. Mehta", classroom: "Room 115", group: "B2", lectureType: "Tutorial" },
  { id: "thu-math-b1", day: "Thursday", startTime: "10:00", endTime: "11:00", subjectId: "math", subject: "Engineering Mathematics", subjectCode: "BTM101", teacher: "Dr. K. Sharma", classroom: "Room 204", group: "B1", lectureType: "Tutorial" },
  { id: "fri-program", day: "Friday", startTime: "09:00", endTime: "10:00", subjectId: "programming", subject: "Programming Fundamentals", subjectCode: "BTI103", teacher: "Mr. A. Singh", classroom: "Lab 2", group: "COMMON", lectureType: "Lecture" },
  { id: "fri-chem", day: "Friday", startTime: "10:00", endTime: "11:00", subjectId: "chemistry", subject: "Applied Chemistry", subjectCode: "BTC104", teacher: "Dr. P. Gill", classroom: "Room 302", group: "COMMON", lectureType: "Lecture" },
  { id: "fri-comm-b1", day: "Friday", startTime: "11:00", endTime: "12:00", subjectId: "communication", subject: "Communication Skills", subjectCode: "BTH105", teacher: "Ms. R. Mehta", classroom: "Room 113", group: "B1", lectureType: "Tutorial" },
];

export const INITIAL_SUBJECT_ATTENDANCE: SubjectAttendance[] = [
  { subjectId: "math", subject: "Engineering Mathematics", subjectCode: "BTM101", present: 21, absent: 5 },
  { subjectId: "physics", subject: "Applied Physics", subjectCode: "BTP102", present: 17, absent: 5 },
  { subjectId: "programming", subject: "Programming Fundamentals", subjectCode: "BTI103", present: 18, absent: 4 },
  { subjectId: "chemistry", subject: "Applied Chemistry", subjectCode: "BTC104", present: 15, absent: 6 },
  { subjectId: "communication", subject: "Communication Skills", subjectCode: "BTH105", present: 19, absent: 3 },
];

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
