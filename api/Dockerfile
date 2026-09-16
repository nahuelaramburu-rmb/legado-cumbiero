# Legado Cumbiero API — imagen de producción (multi-stage)
# openssl explícito: la imagen slim no lo trae, y sin él el motor de
# Prisma no puede detectar la versión de libssl y arriesga linkear mal.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY package.json ./

# tsx + argon2 (deps de prisma/seed.ts y scripts/migrate-sqlite-to-postgres.ts)
# para poder correrlos dentro del contenedor ya desplegado, igual que hace
# el Dockerfile de Next.js con el seed de scripts/seed.ts.
# --include=dev es necesario: con NODE_ENV=production ya seteado arriba,
# un "npm install" sin ese flag instala y en el mismo paso poda tsx de
# vuelta por tratarlo como devDependency (queda "changed 1 package" en el
# log pero el binario nunca sobrevive en la imagen final).
RUN npm install --no-save --include=dev tsx

EXPOSE 3000
CMD ["node", "dist/main.js"]
