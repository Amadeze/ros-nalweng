import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

const DEFAULT_TIMEZONE = "Asia/Jakarta";

export type ZonedPeriod = {
  start: Date;
  end: Date;
  dateKey: string;
  timezone: string;
};

export function normalizeTimeZone(timezone?: string | null): string {
  if (!timezone) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    // Invalid timezone - fallback to default
    return DEFAULT_TIMEZONE;
  }
}

/** Returns a tenant-local calendar day as an exclusive UTC instant range. */
export function getZonedDayRange(
  instant: Date,
  timezone?: string | null,
  dayOffset = 0,
): ZonedPeriod {
  const zone = normalizeTimeZone(timezone);
  const local = toZonedTime(instant, zone);
  local.setDate(local.getDate() + dayOffset);
  local.setHours(0, 0, 0, 0);
  const nextLocal = new Date(local);
  nextLocal.setDate(nextLocal.getDate() + 1);

  return {
    start: fromZonedTime(local, zone),
    end: fromZonedTime(nextLocal, zone),
    dateKey: formatInTimeZone(fromZonedTime(local, zone), zone, "yyyy-MM-dd"),
    timezone: zone,
  };
}

/** Returns a tenant-local month as an exclusive UTC instant range. */
export function getZonedMonthRange(
  year: number,
  month: number,
  timezone?: string | null,
): ZonedPeriod {
  const zone = normalizeTimeZone(timezone);
  const localStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const localEnd = new Date(year, month, 1, 0, 0, 0, 0);
  return {
    start: fromZonedTime(localStart, zone),
    end: fromZonedTime(localEnd, zone),
    dateKey: `${year}-${String(month).padStart(2, "0")}`,
    timezone: zone,
  };
}

/**
 * Mendapatkan waktu saat ini sebagai instant absolut.
 * JavaScript Date tidak menyimpan zona waktu; menggeser nilainya ke wall-clock WIB
 * akan menghasilkan timestamp database yang salah. Gunakan helper format/range di
 * bawah saat representasi kalender WIB memang diperlukan.
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Memformat tanggal ke string lokal Indonesia (WIB).
 * Contoh output: "17 Juli 2026 15:30:00"
 */
export function formatLocal(date: Date, formatStr: string = "d MMMM yyyy HH:mm:ss"): string {
  return formatInTimeZone(date, DEFAULT_TIMEZONE, formatStr);
}

/**
 * Mendapatkan string YYYY-MM-DD hari ini untuk input form atau query database.
 */
export function getTodayString(): string {
  return formatInTimeZone(new Date(), DEFAULT_TIMEZONE, "yyyy-MM-dd");
}

/**
 * Mendapatkan awal hari ini dalam WIB (00:00:00.000) sebagai Date object UTC.
 * Untuk query database, gunakan returned value sebagai `gte` boundary.
 */
export function getStartOfTodayWIB(): Date {
  const localNow = toZonedTime(new Date(), DEFAULT_TIMEZONE);
  localNow.setHours(0, 0, 0, 0);
  return fromZonedTime(localNow, DEFAULT_TIMEZONE);
}

/**
 * Mendapatkan awal hari berikutnya dalam WIB sebagai Date object UTC.
 * Digunakan sebagai `lt` boundary (exclusive) untuk range "hari ini".
 */
export function getStartOfNextDayWIB(): Date {
  const localNow = toZonedTime(new Date(), DEFAULT_TIMEZONE);
  localNow.setDate(localNow.getDate() + 1);
  localNow.setHours(0, 0, 0, 0);
  return fromZonedTime(localNow, DEFAULT_TIMEZONE);
}

/**
 * Mengecek apakah sebuah Date berada dalam range hari ini (WIB).
 * Range: [startOfDay WIB, startOfNextDay WIB)
 */
export function isTodayWIB(date: Date): boolean {
  const start = getStartOfTodayWIB();
  const end = getStartOfNextDayWIB();
  return date >= start && date < end;
}
