import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function hasValidImageSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }
  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      )
    );
  }
  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

export async function uploadImage(input: {
  tenantId: string;
  buffer: Buffer;
  mimeType: string;
}) {
  const extension = MIME_EXTENSIONS[input.mimeType];
  if (!extension || !hasValidImageSignature(input.buffer, input.mimeType)) {
    throw new Error("File content does not match the selected image type.");
  }

  const objectPath = `${input.tenantId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "ros-assets";

  if (supabaseUrl && serviceRoleKey) {
    const body = input.buffer.buffer.slice(
      input.buffer.byteOffset,
      input.buffer.byteOffset + input.buffer.byteLength,
    ) as ArrayBuffer;
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": input.mimeType,
          "x-upsert": "false",
        },
        body,
      },
    );
    if (!response.ok) {
      throw new Error(`Object storage upload failed with status ${response.status}.`);
    }
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Object storage is not configured.");
  }

  const uploadDir = join(process.cwd(), "public", "uploads", input.tenantId);
  await mkdir(uploadDir, { recursive: true });
  const filename = objectPath.split("/").at(-1)!;
  await writeFile(join(uploadDir, filename), input.buffer);
  return `/uploads/${input.tenantId}/${filename}`;
}
