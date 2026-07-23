import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseAlog, isAlogFile } from "../parser";

const fixturesDir = join(__dirname, "fixtures");

describe("Artisan .alog parser", () => {
  it("parses a valid .alog file", () => {
    const buffer = readFileSync(join(fixturesDir, "sample-roast.alog"));
    const result = parseAlog(buffer, "sample-roast.alog");

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { data } = result;
    expect(data.source).toBe("artisan");
    expect(data.title).toBe("Gayo Heavy Roast");
    expect(data.chargeTime).toBe(90); // 01:30
    expect(data.dropTime).toBe(825); // 13:45
    expect(data.durationSeconds).toBe(735); // 12:15
    expect(data.chargeTemperature).toBe(195.2);
    expect(data.dropTemperature).toBe(215.3);
  });

  it("extracts temperature series", () => {
    const buffer = readFileSync(join(fixturesDir, "sample-roast.alog"));
    const result = parseAlog(buffer, "sample-roast.alog");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.beanTemperatureSeries.length).toBeGreaterThan(50);
    expect(result.data.environmentalTemperatureSeries.length).toBeGreaterThan(50);
    expect(result.data.beanTemperatureSeries[0]).toEqual({ second: 0, value: 22.1 });
  });

  it("extracts events", () => {
    const buffer = readFileSync(join(fixturesDir, "sample-roast.alog"));
    const result = parseAlog(buffer, "sample-roast.alog");

    expect(result.success).toBe(true);
    if (!result.success) return;

    const eventTypes = result.data.events.map((e) => e.type);
    expect(eventTypes).toContain("CHARGE");
    expect(eventTypes).toContain("TP");
    expect(eventTypes).toContain("FCs");
    expect(eventTypes).toContain("FCe");
    expect(eventTypes).toContain("SCs");
    expect(eventTypes).toContain("DROP");
  });

  it("extracts first crack timing", () => {
    const buffer = readFileSync(join(fixturesDir, "sample-roast.alog"));
    const result = parseAlog(buffer, "sample-roast.alog");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.firstCrackStartTime).toBe(560); // 09:20
    expect(result.data.firstCrackEndTime).toBe(605); // 10:05
    expect(result.data.secondCrackStartTime).toBe(690); // 11:30
  });

  it("extracts metadata", () => {
    const buffer = readFileSync(join(fixturesDir, "sample-roast.alog"));
    const result = parseAlog(buffer, "sample-roast.alog");

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.metadata.roaster).toBe("Loring S35");
    expect(result.data.metadata.profile).toBe("Full City+");
    expect(result.data.metadata.greenWeightGrams).toBe(200);
    expect(result.data.metadata.roastedWeightGrams).toBe(168);
    expect(result.data.metadata.lossPercent).toBe(16);
  });

  it("rejects non-XML files", () => {
    const buffer = Buffer.from("This is not an XML file");
    const result = parseAlog(buffer, "test.alog");

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errorCode).toBe("INVALID_FILE");
  });

  it("rejects XML without roast element", () => {
    const buffer = Buffer.from('<?xml version="1.0"?><data><item>test</item></data>');
    const result = parseAlog(buffer, "test.alog");

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errorCode).toBe("UNSUPPORTED_ALOG_VERSION");
  });

  it("isAlogFile validates extension", () => {
    expect(isAlogFile("roast.alog")).toBe(true);
    expect(isAlogFile("ROAST.ALOG")).toBe(true);
    expect(isAlogFile("roast.xml")).toBe(false);
    expect(isAlogFile("roast.txt")).toBe(false);
  });
});
