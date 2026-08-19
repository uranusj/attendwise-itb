import { describe, expect, it } from "vitest";

import {
  attendancePercentage,
  canMissMore,
  lecturesToRecover,
  projectedPercentage,
  recommendationFor,
} from "../lib/attendance-calculations";
import type { SubjectAttendance } from "../lib/attendwise-types";

const subject = (present: number, absent: number): SubjectAttendance => ({
  subjectId: "sample",
  subject: "Sample Subject",
  subjectCode: "SMP101",
  present,
  absent,
});

describe("attendance calculations", () => {
  it("calculates the percentage from marked lecture occurrences", () => {
    expect(attendancePercentage(subject(21, 5))).toBeCloseTo(80.769, 2);
  });

  it("calculates an exact safe-miss count above the 75% target", () => {
    expect(canMissMore(subject(21, 5))).toBe(2);
    expect(projectedPercentage(subject(21, 5), false)).toBeCloseTo(77.777, 2);
  });

  it("calculates the minimum consecutive lectures needed to recover", () => {
    expect(lecturesToRecover(subject(15, 6))).toBe(3);
    expect(recommendationFor(subject(15, 6)).kind).toBe("MUST");
  });

  it("marks a subject as safe only when a missed next lecture remains on target", () => {
    expect(recommendationFor(subject(21, 5)).kind).toBe("SAFE");
    expect(recommendationFor(subject(17, 5)).kind).toBe("MUST");
  });
});
