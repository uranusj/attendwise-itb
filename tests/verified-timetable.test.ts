import { describe, expect, it } from "vitest";

import { recommendationFor } from "../lib/attendance-calculations";
import { INITIAL_SUBJECT_ATTENDANCE, SAMPLE_LECTURES } from "../lib/sample-timetable";

describe("verified ITB timetable", () => {
  it("includes the Friday B2 class that begins at 15:30 and ends at 16:30", () => {
    expect(SAMPLE_LECTURES).toContainEqual(expect.objectContaining({
      day: "Friday",
      startTime: "15:30",
      endTime: "16:30",
      group: "B2",
      subject: "Basic Electrical and Electronics Engineering",
      lectureType: "Tutorial",
    }));
  });

  it("keeps late-afternoon B1 practical sessions in the verified schedule", () => {
    expect(SAMPLE_LECTURES).toContainEqual(expect.objectContaining({
      day: "Monday",
      startTime: "13:30",
      endTime: "15:30",
      group: "B1",
      subject: "Programming for Problem Solving",
    }));
  });

  it("starts every subject with no fabricated present or absent attendance", () => {
    for (const subject of INITIAL_SUBJECT_ATTENDANCE) {
      expect(subject.present).toBe(0);
      expect(subject.absent).toBe(0);
      expect(recommendationFor(subject).kind).toBe("PENDING");
    }
  });
});
