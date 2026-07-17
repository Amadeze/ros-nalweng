import { describe, expect, it } from "vitest";

import { hasValidImageSignature } from "./storage";

describe("image signature validation", () => {
  it("accepts matching JPEG, PNG, and WebP signatures", () => {
    expect(
      hasValidImageSignature(Buffer.from([0xff, 0xd8, 0xff, 0x00]), "image/jpeg"),
    ).toBe(true);
    expect(
      hasValidImageSignature(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        "image/png",
      ),
    ).toBe(true);
    expect(
      hasValidImageSignature(
        Buffer.from("RIFF0000WEBP", "ascii"),
        "image/webp",
      ),
    ).toBe(true);
  });

  it("rejects MIME spoofing", () => {
    expect(
      hasValidImageSignature(Buffer.from("<svg></svg>"), "image/png"),
    ).toBe(false);
  });
});
