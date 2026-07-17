import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,80}$/;

export function getRequestId(headers: Headers) {
  const candidate = headers.get("x-request-id")?.trim();
  return candidate && REQUEST_ID_PATTERN.test(candidate) ? candidate : randomUUID();
}

export function logServerError(
  scope: string,
  error: unknown,
  context: Record<string, unknown> = {},
) {
  const normalized = error instanceof Error
    ? {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      }
    : { errorName: "UnknownError", errorMessage: String(error) };

  console.error(JSON.stringify({
    level: "error",
    scope,
    timestamp: new Date().toISOString(),
    ...context,
    ...normalized,
  }));
}

export function internalErrorResponse(
  requestId: string,
  message = "Terjadi kesalahan sistem. Silakan coba lagi.",
) {
  return NextResponse.json(
    {
      error: message,
      requestId,
    },
    {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
      },
    },
  );
}
