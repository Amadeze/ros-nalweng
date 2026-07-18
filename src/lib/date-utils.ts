import { toZonedTime, format } from "date-fns-tz";

const DEFAULT_TIMEZONE = "Asia/Jakarta";

/**
 * Mendapatkan objek Date waktu saat ini yang telah disesuaikan dengan zona waktu Asia/Jakarta.
 * Gunakan fungsi ini untuk menggantikan `new Date()` pada operasi pembuatan transaksi,
 * mutasi, laporan, atau audit yang sensitif terhadap zona waktu lokal.
 */
export function getCurrentDate(): Date {
  return toZonedTime(new Date(), DEFAULT_TIMEZONE);
}

/**
 * Memformat tanggal ke string lokal Indonesia (WIB).
 * Contoh output: "17 Juli 2026 15:30:00"
 */
export function formatLocal(date: Date, formatStr: string = "d MMMM yyyy HH:mm:ss"): string {
  const zonedDate = toZonedTime(date, DEFAULT_TIMEZONE);
  return format(zonedDate, formatStr, { timeZone: DEFAULT_TIMEZONE });
}

/**
 * Mendapatkan string YYYY-MM-DD hari ini untuk input form atau query database.
 */
export function getTodayString(): string {
  const zonedDate = toZonedTime(new Date(), DEFAULT_TIMEZONE);
  return format(zonedDate, "yyyy-MM-dd", { timeZone: DEFAULT_TIMEZONE });
}

/**
 * Mendapatkan awal hari ini dalam WIB (00:00:00.000) sebagai Date object UTC.
 * Untuk query database, gunakan returned value sebagai `gte` boundary.
 */
export function getStartOfTodayWIB(): Date {
  const now = new Date();
  const zoned = toZonedTime(now, DEFAULT_TIMEZONE);
  zoned.setHours(0, 0, 0, 0);
  return zoned;
}

/**
 * Mendapatkan awal hari berikutnya dalam WIB sebagai Date object UTC.
 * Digunakan sebagai `lt` boundary (exclusive) untuk range "hari ini".
 */
export function getStartOfNextDayWIB(): Date {
  const start = getStartOfTodayWIB();
  start.setDate(start.getDate() + 1);
  return start;
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
