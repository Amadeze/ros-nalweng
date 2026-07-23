import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateConnector } from "@/lib/artisan/connector-auth";
import { isAlogFile, parseAlog } from "@/lib/artisan/parser";
import { enforceRateLimit, RateLimitError, requestIdentifier } from "@/lib/rate-limit";
import { uploadImage } from "@/lib/storage";
import {
  getRequestId,
  internalErrorResponse,
  logServerError,
  logInfo,
} from "@/lib/api-observability";
import { recordAudit } from "@/lib/audit";
import crypto from "crypto";

const MAX_UPLOAD_BYTES = parseInt(
  process.env.ARTISAN_MAX_UPLOAD_BYTES || String(10 * 1024 * 1024),
  10,
);

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req.headers);
  try {
    const auth = await authenticateConnector(req.headers.get("authorization"));
    if (!auth) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Autentikasi gagal." } },
        { status: 401 },
      );
    }

    const ip = requestIdentifier(req.headers);
    await enforceRateLimit({
      scope: "artisan:upload",
      identifier: `${auth.connectorId}:${ip}`,
      limit: 30,
      windowSeconds: 60,
    });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileHashClaimed = formData.get("fileHash") as string | null;
    const originalFilename = formData.get("originalFilename") as string | null;
    const fileModifiedAtStr = formData.get("fileModifiedAt") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: "INVALID_FILE", message: "File tidak ditemukan." } },
        { status: 400 },
      );
    }

    if (!originalFilename) {
      return NextResponse.json(
        { error: { code: "INVALID_FILE", message: "originalFilename wajib diisi." } },
        { status: 400 },
      );
    }

    // Sanitize filename
    const sanitizedFilename = originalFilename
      .replace(/[^\w\s.\-]/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 255);

    if (!isAlogFile(sanitizedFilename)) {
      return NextResponse.json(
        { error: { code: "INVALID_FILE", message: "Hanya file .alog yang diizinkan." } },
        { status: 400 },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: `Ukuran file melebihi batas maksimum (${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB).`,
          },
        },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: { code: "INVALID_FILE", message: "File kosong." } },
        { status: 400 },
      );
    }

    // Read file bytes and compute hash
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 10) {
      return NextResponse.json(
        { error: { code: "INVALID_FILE", message: "File terlalu kecil atau malformed." } },
        { status: 400 },
      );
    }

    const actualHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Verify claimed hash matches
    if (fileHashClaimed && fileHashClaimed !== actualHash) {
      return NextResponse.json(
        {
          error: {
            code: "HASH_MISMATCH",
            message: "Hash file tidak cocok.",
          },
        },
        { status: 400 },
      );
    }

    // Check for duplicate (idempotency)
    const existingImport = await prisma.artisanRoastImport.findUnique({
      where: {
        tenantId_machineId_fileHash: {
          tenantId: auth.tenantId,
          machineId: auth.machineId,
          fileHash: actualHash,
        },
      },
      select: { id: true, roastId: true, status: true },
    });

    if (existingImport) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        importId: existingImport.id,
        roastId: existingImport.roastId,
      });
    }

    // Store file (raw upload for reprocessing)
    const storageKey = `artisan/${auth.tenantId}/${auth.machineId}/${Date.now()}-${crypto.randomUUID()}.alog`;

    // Try Supabase storage, fall back to local
    let storedUrl: string;
    try {
      storedUrl = await uploadImage({
        tenantId: auth.tenantId,
        buffer,
        mimeType: "application/octet-stream",
      });
    } catch {
      // If storage fails, we still record the import with raw data reference
      storedUrl = storageKey;
    }

    const fileModifiedAt = fileModifiedAtStr
      ? new Date(fileModifiedAtStr)
      : null;

    // Create import record
    const importRecord = await prisma.artisanRoastImport.create({
      data: {
        tenantId: auth.tenantId,
        machineId: auth.machineId,
        connectorId: auth.connectorId,
        originalFilename: sanitizedFilename,
        fileHash: actualHash,
        fileSize: buffer.length,
        storageKey: storedUrl,
        status: "UPLOADED",
        fileModifiedAt,
      },
    });

    // Attempt parsing
    const parseResult = parseAlog(buffer, sanitizedFilename);

    if (parseResult.success) {
      // Create Roast record from parsed data
      const roast = await prisma.roast.create({
        data: {
          tenantId: auth.tenantId,
          machineId: auth.machineId,
          importId: importRecord.id,
          title: parseResult.data.title,
          roastDate: parseResult.data.roastDate ? new Date(parseResult.data.roastDate) : null,
          sourceVersion: parseResult.data.sourceVersion,
          chargeTime: parseResult.data.chargeTime,
          dropTime: parseResult.data.dropTime,
          duration: parseResult.data.durationSeconds,
          chargeTemperature: parseResult.data.chargeTemperature,
          dropTemperature: parseResult.data.dropTemperature,
          dryEndTime: parseResult.data.dryEndTime,
          firstCrackStartTime: parseResult.data.firstCrackStartTime,
          firstCrackEndTime: parseResult.data.firstCrackEndTime,
          secondCrackStartTime: parseResult.data.secondCrackStartTime,
          greenWeightGrams: parseResult.data.metadata.greenWeightGrams as number | undefined,
          roastedWeightGrams: parseResult.data.metadata.roastedWeightGrams as number | undefined,
          lossPercent: parseResult.data.metadata.lossPercent as number | undefined,
          metadata: parseResult.data.metadata as any,
          beanTemperatureSeries: parseResult.data.beanTemperatureSeries as any,
          environmentalTemperatureSeries: parseResult.data.environmentalTemperatureSeries as any,
          events: parseResult.data.events as any,
        },
      });

      // Update import with roast ID
      await prisma.artisanRoastImport.update({
        where: { id: importRecord.id },
        data: {
          status: "IMPORTED",
          importedAt: new Date(),
          roastId: roast.id,
        },
      });

      // AUTO-MATCH: Link roast to next pending ChildRoastingBatch for this machine
      // Find a batch that:
      // 1. Is PENDING
      // 2. Has the same machineId as the roast's machine
      // 3. Has ChildRoastingBatches without a roastId
      const pendingBatch = await prisma.parentRoastingBatch.findFirst({
        where: {
          tenantId: auth.tenantId,
          machineId: auth.machineId,
          status: "PENDING",
        },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          childBatches: {
            where: { roastId: null },
            select: { id: true },
            take: 1,
          },
        },
      });

      if (pendingBatch && pendingBatch.childBatches.length > 0) {
        const childId = pendingBatch.childBatches[0].id;
        await prisma.childRoastingBatch.update({
          where: { id: childId },
          data: {
            roastId: roast.id,
            roastDuration: roast.duration,
            dropTemp: roast.dropTemperature,
          },
        });

        await recordAudit(prisma, {
          tenantId: auth.tenantId,
          action: "AUTO_MATCH",
          entityType: "ChildRoastingBatch",
          entityId: childId,
          metadata: {
            roastId: roast.id,
            roastTitle: roast.title,
            batchId: pendingBatch.id,
            machineId: auth.machineId,
          },
        });

        logInfo("artisan.upload", "Roast auto-matched to batch", {
          roastId: roast.id,
          batchId: pendingBatch.id,
          machineId: auth.machineId,
        });
      }

      await recordAudit(prisma, {
        tenantId: auth.tenantId,
        action: "UPLOAD",
        entityType: "ArtisanRoastImport",
        entityId: importRecord.id,
        metadata: {
          filename: sanitizedFilename,
          fileSize: buffer.length,
          hash: actualHash,
          parsed: true,
        },
      });

      return NextResponse.json({
        success: true,
        duplicate: false,
        importId: importRecord.id,
        roastId: roast.id,
      });
    }

    // Parse failed — keep import for reprocessing
    await prisma.artisanRoastImport.update({
      where: { id: importRecord.id },
      data: {
        status: "FAILED",
        errorCode: parseResult.errorCode,
        errorMessage: parseResult.errorMessage,
      },
    });

    await recordAudit(prisma, {
      tenantId: auth.tenantId,
      action: "IMPORT_FAILED",
      entityType: "ArtisanRoastImport",
      entityId: importRecord.id,
      metadata: {
        filename: sanitizedFilename,
        errorCode: parseResult.errorCode,
        errorMessage: parseResult.errorMessage,
      },
    });

    // Return success to connector — the file was received, parsing failure is non-blocking
    return NextResponse.json({
      success: true,
      duplicate: false,
      importId: importRecord.id,
      roastId: null,
    });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: e.message } },
        { status: 429, headers: { "Retry-After": String(e.retryAfter) } },
      );
    }
    logServerError("artisan.upload", e, { requestId });
    return internalErrorResponse(requestId, "Upload gagal diproses.");
  }
}
