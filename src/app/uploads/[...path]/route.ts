import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Sirve los archivos subidos (logos/portadas de boliches) desde el volumen
 * compartido con legado-api. No pueden vivir en `public/`: en producción
 * standalone, Next arma un manifiesto de archivos estáticos en build time,
 * así que un archivo agregado después (como un upload en runtime) 404ea
 * aunque exista en disco — por eso esto es un Route Handler, evaluado por
 * request, no servido desde el manifiesto.
 */

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  if (segments.length === 0 || segments.some((s) => !s || s.includes(".."))) {
    return new NextResponse(null, { status: 400 });
  }

  const ext = path.extname(segments[segments.length - 1]).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return new NextResponse(null, { status: 404 });

  const filePath = path.join(UPLOADS_ROOT, ...segments);
  if (!filePath.startsWith(UPLOADS_ROOT)) return new NextResponse(null, { status: 400 });

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
