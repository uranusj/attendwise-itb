import { describe, expect, it } from "vitest";

import { ATTENDANCE_END, ATTENDANCE_START, dateFromKey, dateKey, isWeekend, isWithinAttendanceRange, monthGrid } from "../lib/attendance-calendar";

describe("attendance calendar", () => {
  it("uses the requested inclusive attendance range from 12 August through 31 December 2026", () => {
    expect(dateKey(ATTENDANCE_START)).toBe("2026-08-12");
    expect(dateKey(ATTENDANCE_END)).toBe("2026-12-31");
    expect(isWithinAttendanceRange(dateFromKey("2026-08-11"))).toBe(false);
    expect(isWithinAttendanceRange(dateFromKey("2026-08-12"))).toBe(true);
    expect(isWithinAttendanceRange(dateFromKey("2026-12-31"))).toBe(true);
    expect(isWithinAttendanceRange(dateFromKey("2027-01-01"))).toBe(false);
  });

  it("classifies Saturday and Sunday as weekend holidays", () => {
    expect(isWeekend(dateFromKey("2026-08-15"))).toBe(true);
    expect(isWeekend(dateFromKey("2026-08-16"))).toBe(true);
    expect(isWeekend(dateFromKey("2026-08-17"))).toBe(false);
  });

  it("builds complete Sunday-first month grids", () => {
    const december = monthGrid(2026, 11);
    expect(december.length % 7).toBe(0);
    expect(december.filter(Boolean)).toHaveLength(31);
  });
});
