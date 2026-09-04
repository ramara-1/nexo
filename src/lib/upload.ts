import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const MAX = 12 * 1024 * 1024;

export async function saveUpload(file: File) {
  if (file.size > MAX) {
    throw new Error("Arquivo grande demais (máx. 12 MB).");
  }
  const ext = path.extname(file.name).slice(0, 8) || "";
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);
  const mime = file.type;
  const mediaKind = mime.startsWith("image/")
    ? "image"
    : mime.startsWith("video/")
      ? "video"
      : "file";
  return { url: `/uploads/${name}`, mediaKind, fileName: file.name };
}
