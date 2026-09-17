-- Migración manual (no generada por `prisma migrate dev`): separa User.name
-- en firstName/lastName con backfill de los datos existentes antes de
-- imponer NOT NULL y borrar la columna vieja. Ver api/prisma/schema.prisma.

-- Columnas nuevas, todas nullable por ahora
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN "phoneAreaCode" TEXT;
ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "birthDate" DATE;
ALTER TABLE "User" ADD COLUMN "provinceId" TEXT;
ALTER TABLE "User" ADD COLUMN "cityId" TEXT;
ALTER TABLE "User" ADD COLUMN "marketingOptIn" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: primer "token" de "name" -> firstName, resto -> lastName
-- (si no hay espacio, lastName queda '-' en vez de duplicar el nombre)
UPDATE "User" SET
  "firstName" = split_part("name", ' ', 1),
  "lastName"  = CASE
    WHEN position(' ' in "name") = 0 THEN '-'
    ELSE substring("name" from position(' ' in "name") + 1)
  END;

-- Ahora que todas las filas tienen valor, forzar NOT NULL
ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;

-- Borrar la columna vieja
ALTER TABLE "User" DROP COLUMN "name";

-- Índices y FKs de los campos de ubicación opcionales
CREATE INDEX "User_provinceId_idx" ON "User"("provinceId");
CREATE INDEX "User_cityId_idx" ON "User"("cityId");

ALTER TABLE "User" ADD CONSTRAINT "User_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Favorite (nueva tabla)
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Favorite_userId_tenantId_key" ON "Favorite"("userId", "tenantId");
CREATE INDEX "Favorite_tenantId_idx" ON "Favorite"("tenantId");

ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
