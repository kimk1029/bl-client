import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), '.uploads');

export const ensureUploadDir = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};

export const saveUploadedFile = async (file: File): Promise<string> => {
  await ensureUploadDir();
  const ext = path.extname(file.name) || '';
  const filename = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);
  return filename;
};

export const toImageUrl = (filename: string): string => `/api/uploads/${filename}`;
