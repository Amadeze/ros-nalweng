import type { ParsedArtisanRoast } from "./types";

export type ParseResult =
  | { success: true; data: ParsedArtisanRoast }
  | { success: false; errorCode: string; errorMessage: string };

/**
 * Parse time string "MM:SS" to seconds.
 */
function parseTimeToSeconds(time: string): number {
  const parts = time.split(":");
  if (parts.length !== 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/**
 * Extract text content from an XML tag using regex.
 */
function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match?.[1]?.trim() ?? null;
}

/**
 * Parse a raw .alog file buffer into a normalized roast record.
 */
export function parseAlog(buffer: Buffer, filename: string): ParseResult {
  try {
    const xml = buffer.toString("utf-8");

    // Validate it's XML
    if (!xml.trimStart().startsWith("<?xml") && !xml.trimStart().startsWith("<roast")) {
      return {
        success: false,
        errorCode: "INVALID_FILE",
        errorMessage: "File bukan format .alog yang valid (bukan XML).",
      };
    }

    // Check for root element
    if (!xml.includes("<roast")) {
      return {
        success: false,
        errorCode: "UNSUPPORTED_ALOG_VERSION",
        errorMessage: "Format .alog tidak dikenali (element <roast> tidak ditemukan).",
      };
    }

    // Extract basic metadata
    const title = extractTag(xml, "title") ?? undefined;
    const beans = extractTag(xml, "beans") ?? undefined;
    const notes = extractTag(xml, "notes") ?? undefined;
    const sourceVersion = extractTag(xml, "softwareVersion") ?? undefined;

    // Extract weight - look for the <weight> tag with attributes
    const weightTagMatch = xml.match(/<weight\s+([^>]+)\/?>/i);
    let greenWeight: string | null = null;
    let roastedWeight: string | null = null;
    let lossPercent: string | null = null;

    if (weightTagMatch) {
      const weightAttrs = weightTagMatch[1];
      const greenMatch = weightAttrs.match(/green=["']([^"']+)["']/);
      const roastedMatch = weightAttrs.match(/roasted=["']([^"']+)["']/);
      const lossMatch = weightAttrs.match(/loss=["']([^"']+)["']/);
      if (greenMatch) greenWeight = greenMatch[1];
      if (roastedMatch) roastedWeight = roastedMatch[1];
      if (lossMatch) lossPercent = lossMatch[1];
    }

    // Extract time info - look for the <time> tag with attributes
    const timeTagMatch = xml.match(/<time\s+([^>]+)\/?>/i);
    let chargeTime: number | undefined;
    let dropTime: number | undefined;
    let durationSeconds: number | undefined;

    if (timeTagMatch) {
      const timeAttrs = timeTagMatch[1];
      const chargeMatch = timeAttrs.match(/charge=["']([^"']+)["']/);
      const dropMatch = timeAttrs.match(/drop=["']([^"']+)["']/);
      const totalMatch = timeAttrs.match(/total=["']([^"']+)["']/);
      if (chargeMatch) chargeTime = parseTimeToSeconds(chargeMatch[1]);
      if (dropMatch) dropTime = parseTimeToSeconds(dropMatch[1]);
      if (totalMatch) durationSeconds = parseTimeToSeconds(totalMatch[1]);
    }

    // Extract events
    const events: ParsedArtisanRoast["events"] = [];
    const eventRegex = /<event\s+name=["']([^"']+)["']\s+time=["']([^"']+)["']\s+tempBT=["']([^"']+)["']\s+tempET=["']([^"']+)["']\s*\/?>/gi;
    let eventMatch;
    while ((eventMatch = eventRegex.exec(xml)) !== null) {
      events.push({
        second: parseTimeToSeconds(eventMatch[2]),
        type: eventMatch[1],
        value: `${eventMatch[3]}/${eventMatch[4]}`,
        label: eventMatch[1],
      });
    }

    // Extract charge and drop temperatures from events
    const chargeEvent = events.find((e) => e.type === "CHARGE");
    const dropEvent = events.find((e) => e.type === "DROP");
    const chargeTemperature = chargeEvent
      ? parseFloat(String(chargeEvent.value).split("/")[0])
      : undefined;
    const dropTemperature = dropEvent
      ? parseFloat(String(dropEvent.value).split("/")[0])
      : undefined;

    // Extract dry end (TP event or after turn-around)
    const tpEvent = events.find((e) => e.type === "TP");
    const dryEndTime = tpEvent?.second;

    // Extract first crack events
    const fcsEvent = events.find((e) => e.type === "FCs");
    const fceEvent = events.find((e) => e.type === "FCe");
    const scsEvent = events.find((e) => e.type === "SCs");

    // Extract temperature curves
    const beanTemperatureSeries: ParsedArtisanRoast["beanTemperatureSeries"] = [];
    const environmentalTemperatureSeries: ParsedArtisanRoast["environmentalTemperatureSeries"] = [];
    const pointRegex = /<point\s+time=["']([^"']+)["']\s+bt=["']([^"']+)["']\s+et=["']([^"']+)["']\s*\/?>/gi;
    let pointMatch;
    while ((pointMatch = pointRegex.exec(xml)) !== null) {
      const second = parseTimeToSeconds(pointMatch[1]);
      const bt = parseFloat(pointMatch[2]);
      const et = parseFloat(pointMatch[3]);
      if (!isNaN(bt)) {
        beanTemperatureSeries.push({ second, value: bt });
      }
      if (!isNaN(et)) {
        environmentalTemperatureSeries.push({ second, value: et });
      }
    }

    // Extract metadata
    const metadata: Record<string, unknown> = {};
    const roaster = extractTag(xml, "roaster");
    const profile = extractTag(xml, "profile");
    const ambientTemp = extractTag(xml, "ambientTemp");
    const ambientHumidity = extractTag(xml, "ambientHumidity");
    if (roaster) metadata.roaster = roaster;
    if (profile) metadata.profile = profile;
    if (ambientTemp) metadata.ambientTemp = parseFloat(ambientTemp);
    if (ambientHumidity) metadata.ambientHumidity = parseFloat(ambientHumidity);
    if (greenWeight) metadata.greenWeightGrams = parseFloat(greenWeight);
    if (roastedWeight) metadata.roastedWeightGrams = parseFloat(roastedWeight);
    if (lossPercent) metadata.lossPercent = parseFloat(lossPercent);
    if (beans) metadata.beans = beans;
    if (notes) metadata.notes = notes;

    // Build roast date from filename or current date
    const dateMatch = filename.match(/(\d{4}[-_]\d{2}[-_]\d{2})/);
    const roastDate = dateMatch
      ? dateMatch[1].replace(/_/g, "-")
      : new Date().toISOString().split("T")[0];

    const data: ParsedArtisanRoast = {
      source: "artisan",
      sourceVersion,
      title: title ?? filename.replace(/\.alog$/i, ""),
      roastDate,
      chargeTime,
      dropTime,
      durationSeconds,
      chargeTemperature,
      dropTemperature,
      dryEndTime,
      firstCrackStartTime: fcsEvent?.second,
      firstCrackEndTime: fceEvent?.second,
      secondCrackStartTime: scsEvent?.second,
      beanTemperatureSeries,
      environmentalTemperatureSeries,
      events,
      metadata,
    };

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      errorCode: "PARSER_ERROR",
      errorMessage: `Gagal parse file .alog: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Validate that a file has .alog extension.
 */
export function isAlogFile(filename: string): boolean {
  return filename.toLowerCase().endsWith(".alog");
}
