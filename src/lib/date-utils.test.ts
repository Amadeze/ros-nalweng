import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatLocal,
  getCurrentDate,
  getZonedDayRange,
  getZonedMonthRange,
  getStartOfNextDayWIB,
  getStartOfTodayWIB,
  getTodayString,
  isTodayWIB,
} from "./date-utils";

describe("WIB date helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T17:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the current Date as the true instant", () => {
    expect(getCurrentDate().toISOString()).toBe("2026-07-19T17:30:00.000Z");
  });

  it("formats calendar values in Asia/Jakarta", () => {
    expect(getTodayString()).toBe("2026-07-20");
    expect(formatLocal(getCurrentDate(), "yyyy-MM-dd HH:mm")).toBe("2026-07-20 00:30");
  });

  it("returns UTC instants for Jakarta day boundaries", () => {
    expect(getStartOfTodayWIB().toISOString()).toBe("2026-07-19T17:00:00.000Z");
    expect(getStartOfNextDayWIB().toISOString()).toBe("2026-07-20T17:00:00.000Z");
    expect(isTodayWIB(new Date("2026-07-20T10:00:00.000Z"))).toBe(true);
    expect(isTodayWIB(new Date("2026-07-20T17:00:00.000Z"))).toBe(false);
  });
});

describe("tenant reporting periods", () => {
  it("creates an exclusive Jakarta calendar-day range", () => {
    const range = getZonedDayRange(new Date("2026-07-19T12:00:00.000Z"), "Asia/Jakarta");
    expect(range.start.toISOString()).toBe("2026-07-18T17:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-07-19T17:00:00.000Z");
    expect(range.dateKey).toBe("2026-07-19");
  });

  it("supports tenant timezones and month boundaries", () => {
    const range = getZonedMonthRange(2026, 7, "Asia/Jayapura");
    expect(range.start.toISOString()).toBe("2026-06-30T15:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-07-31T15:00:00.000Z");
  });
});
