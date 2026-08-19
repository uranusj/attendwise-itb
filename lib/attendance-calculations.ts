import type { Recommendation, SubjectAttendance } from "@/lib/attendwise-types";

export const TARGET_ATTENDANCE = 0.75;

export function markedTotal(subject: SubjectAttendance) {
  return subject.present + subject.absent;
}

export function attendancePercentage(subject: SubjectAttendance) {
  const total = markedTotal(subject);
  return total === 0 ? 0 : (subject.present / total) * 100;
}

export function projectedPercentage(subject: SubjectAttendance, attended: boolean) {
  const total = markedTotal(subject) + 1;
  const present = subject.present + (attended ? 1 : 0);
  return total === 0 ? 0 : (present / total) * 100;
}

export function canMissMore(subject: SubjectAttendance) {
  const total = markedTotal(subject);
  if (total === 0 || subject.present / total < TARGET_ATTENDANCE) return 0;
  return Math.max(0, Math.floor(subject.present / TARGET_ATTENDANCE - total));
}

export function lecturesToRecover(subject: SubjectAttendance) {
  const total = markedTotal(subject);
  if (total === 0 || subject.present / total >= TARGET_ATTENDANCE) return 0;
  return Math.max(0, Math.ceil((TARGET_ATTENDANCE * total - subject.present) / (1 - TARGET_ATTENDANCE)));
}

export function recommendationFor(subject: SubjectAttendance): Recommendation {
  if (markedTotal(subject) === 0) {
    return {
      kind: "PENDING",
      label: "NO RECORDS YET",
      detail: "Mark actual lecture outcomes to calculate your attendance and 75% recommendation.",
      ifAttended: 100,
      ifMissed: 0,
      canMiss: 0,
      requiredToRecover: 0,
    };
  }
  const ifAttended = projectedPercentage(subject, true);
  const ifMissed = projectedPercentage(subject, false);
  const canMiss = canMissMore(subject);
  const requiredToRecover = lecturesToRecover(subject);

  if (requiredToRecover > 0 || ifMissed < TARGET_ATTENDANCE * 100) {
    const detail = requiredToRecover > 0
      ? `Attend the next ${requiredToRecover} ${requiredToRecover === 1 ? "lecture" : "lectures"} to reach 75%.`
      : "Missing this lecture would take this subject below 75%.";
    return { kind: "MUST", label: "MUST ATTEND", detail, ifAttended, ifMissed, canMiss, requiredToRecover };
  }

  if (canMiss <= 1) {
    return {
      kind: "RISK",
      label: "ATTENDANCE AT RISK",
      detail: "You remain above 75% if you miss this lecture, but your buffer is very small.",
      ifAttended,
      ifMissed,
      canMiss,
      requiredToRecover,
    };
  }

  return {
    kind: "SAFE",
    label: "SAFE TO MISS",
    detail: `You can miss ${canMiss} more ${canMiss === 1 ? "lecture" : "lectures"} and remain at or above 75%.`,
    ifAttended,
    ifMissed,
    canMiss,
    requiredToRecover,
  };
}
