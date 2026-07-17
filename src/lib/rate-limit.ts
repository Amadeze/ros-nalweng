import crypto from "crypto";

import { prisma } from "./prisma";

export class RateLimitError extends Error {
  retryAfter: number;

  constructor(retryAfter: number) {
    super("Terlalu banyak permintaan. Silakan coba lagi nanti.");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

type RateLimitInput = {
  scope: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

export function requestIdentifier(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "unknown";
}

export async function enforceRateLimit({
  scope,
  identifier,
  limit,
  windowSeconds,
}: RateLimitInput) {
  const nowMs = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const windowStart = new Date(windowStartMs);
  const expiresAt = new Date(windowStartMs + windowMs);
  const identifierHash = crypto
    .createHash("sha256")
    .update(identifier)
    .digest("hex");
  const key = `${scope}:${identifierHash}:${windowStartMs}`;

  const bucket = await prisma.rateLimitBucket.upsert({
    where: { key },
    create: { key, count: 1, windowStart, expiresAt },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  if (bucket.count > limit) {
    throw new RateLimitError(
      Math.max(1, Math.ceil((expiresAt.getTime() - nowMs) / 1000)),
    );
  }

  return {
    remaining: Math.max(0, limit - bucket.count),
    resetAt: expiresAt,
  };
}
