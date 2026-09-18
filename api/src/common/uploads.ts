import { BadRequestException } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/** Compartido con legado-cumbiero vía el volumen Docker legado-uploads. */
export const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

const ALLOWED_IMAGE_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Guarda una imagen subida bajo uploads/<entityKind>/<entityId>/<kind>-<ts>.<ext>
 * y borra el archivo anterior si había uno (evita acumular basura al
 * reemplazar). Devuelve la ruta pública (/uploads/...) para guardar en la DB.
 */
export async function saveUploadedImage(
  entityKind: string,
  entityId: string,
  kind: string,
  file: Express.Multer.File,
  previousUrl: string | null,
): Promise<string> {
  const ext = ALLOWED_IMAGE_MIME[file.mimetype];
  if (!ext) throw new BadRequestException('Formato de imagen no soportado — usá JPG, PNG o WEBP');

  const dir = path.join(UPLOADS_ROOT, entityKind, entityId);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${kind}-${Date.now()}.${ext}`;
  await fs.writeFile(path.join(dir, filename), file.buffer);

  if (previousUrl) {
    await fs.unlink(path.join(UPLOADS_ROOT, previousUrl.replace(/^\/uploads\//, ''))).catch(() => {});
  }

  return `/uploads/${entityKind}/${entityId}/${filename}`;
}
