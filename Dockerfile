# Legado Cumbiero — imagen de producción (multi-stage)
# Node 22+ es requerido por node:sqlite (usado en src/lib/db.ts).

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js "standalone" output: server mínimo + node_modules necesarios.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Se suma tsx + el código fuente de la capa de datos y el seed, para poder
# correr `docker compose exec legado-cumbiero npm run seed` en el VPS sin
# tener que copiar el .db a mano.
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder /app/node_modules/.bin/tsx ./node_modules/.bin/tsx
COPY scripts ./scripts
COPY src/lib/db.ts ./src/lib/db.ts
COPY package.json ./package.json

# La base SQLite vive en /app/data — se monta como volumen para persistir
# datos entre despliegues/reinicios del contenedor.
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "server.js"]
