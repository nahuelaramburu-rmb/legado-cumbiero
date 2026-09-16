# Legado Cumbiero — API

Servicio backend en **NestJS + PostgreSQL** que reemplaza a `src/lib/db.ts`
(SQLite) del monorepo Next.js: es dueño de todos los datos de la plataforma
(boliches, shows, reservas, listas de invitados) más usuarios, roles y
permisos. Ver el plan completo de la migración en
`C:\Users\usuario\.claude\plans\squishy-munching-newell.md` (contexto,
decisiones técnicas y etapas).

## Stack

- **NestJS 11** (Express), TypeScript, CommonJS + Jest (se optó por la línea
  estable v11 en vez del recién salido v12, cuyo ecosistema de plugins
  todavía no lo soporta del todo).
- **Prisma 6** + PostgreSQL 16.
- **argon2id** para hash de contraseñas.
- **JWT** access token (15 min, verificado localmente sin ir a la base) +
  **refresh token opaco** (no JWT, hasheado en Postgres, rotación con
  detección de reuso — ver "Flujo de auth").
- `class-validator`/`class-transformer` para DTOs, `@nestjs/swagger` (docs
  en `/api/v1/docs`), `@nestjs/throttler` (rate limit, más estricto en auth),
  `helmet`.

## Setup local

Requiere Postgres corriendo (no hay uno embebido — esta máquina de
desarrollo no tenía Docker, así que el código se escribió y verificó con
TypeScript/build limpios, y la primera corrida en vivo se hizo directo
contra el Postgres real de la VPS — ver "Verificado en producción" abajo).

```bash
cd api
cp .env.example .env   # completar DATABASE_URL, JWT_*_SECRET
npm install
npx prisma migrate dev   # crea las tablas
npm run seed              # datos de ejemplo (4 boliches, ver abajo)
npm run start:dev
```

### Seed de ejemplo (`prisma/seed.ts`)

Mismo set de datos que el viejo `scripts/seed.ts`: El Túnel, K'mina Club, El
Galpón y Bunker, cada uno con su `TENANT_ADMIN`, shows, reservas y listas de
invitados — más un `SUPER_ADMIN` de plataforma y un `TENANT_STAFF` de
ejemplo (con permisos parciales: sólo `GUEST_LIST_MANAGE` +
`RESERVATIONS_MANAGE`, para poder probar el recorte de permisos).

Todas las cuentas de ejemplo usan la misma contraseña: `Cumbia123!` (o la
que se pase en `SEED_PASSWORD`). El script se niega a correr si
`NODE_ENV=production` — es sólo para desarrollo, nunca para la base real.

| Email | Rol | Boliche |
|---|---|---|
| `admin@legadocumbiero.com` | SUPER_ADMIN | — (plataforma) |
| `romina@eltunel.com` | TENANT_ADMIN | El Túnel |
| `diego@kmina.com` | TENANT_ADMIN | K'mina Club |
| `marisa@elgalpon.com` | TENANT_ADMIN | El Galpón |
| `nahuel@bunker.com` | TENANT_ADMIN | Bunker |
| `bruno@eltunel.com` | TENANT_STAFF | El Túnel (permisos: lista de invitados + reservas) |

## Roles y permisos

| Rol | Alcance |
|---|---|
| `SUPER_ADMIN` | Todo, sin scoping por tenant. Dueño de la plataforma. |
| `TENANT_ADMIN` | Todos los permisos dentro de **su** tenant (implícito, sin filas en `StaffPermission`) + gestiona sus propios `TENANT_STAFF`. |
| `TENANT_STAFF` | Sólo las categorías de permiso que su `TENANT_ADMIN` le haya asignado explícitamente. |
| `CUSTOMER` | Público + (a futuro) sus propias reservas. Se autoregistra. |

Categorías de permiso asignables a `TENANT_STAFF` (`PermissionKey`):

- `SHOWS_MANAGE` — crear/editar shows y line-up
- `RESERVATIONS_MANAGE` — ver/gestionar reservas
- `GUEST_LIST_MANAGE` — gestionar lista de invitados
- `TENANT_SETTINGS_MANAGE` — editar datos/branding del boliche

Implementado con 4 guards que se aplican en cadena (`RolesGuard` →
`TenantScopeGuard` → `PermissionsGuard`) más un `JwtAuthGuard` global (con
`@Public()` como opt-out) — ver `src/common/guards/`.

## Flujo de auth

Diseño clave: **el navegador nunca habla directo con esta API**. Next.js
(el frontend) actúa de proxy server-to-server — llama a estos endpoints
desde su propio servidor (vía la URL interna de Docker) y es Next.js quien
emite la cookie de sesión al navegador. Por eso esta API no maneja cookies
en absoluto: login/refresh/logout reciben y devuelven el token en el body
JSON, no en `Set-Cookie`.

El subdominio público (`api.legadocumbiero.rmbcorp.com`) existe para
consumidores futuros (app nativa, integraciones), no para el propio flujo
web.

1. `POST /auth/login` `{ email, password }` → `{ user, accessToken,
   refreshToken, refreshTokenExpiresAt }`
2. El access token (JWT, 15 min) se manda en `Authorization: Bearer ...` en
   cada request protegido.
3. Cuando expira, `POST /auth/refresh` `{ refreshToken }` rota el refresh
   token (revoca el viejo, emite uno nuevo con la misma `family`) y devuelve
   un access token nuevo. Si se presenta un refresh token ya rotado (reuso —
   señal de robo), se revoca toda la `family` y hay que loguearse de nuevo.
4. `POST /auth/logout` `{ refreshToken }` revoca ese token.

## Endpoints

Prefijo global: `/api/v1`. Doc interactiva completa en `/api/v1/docs`
(Swagger) una vez levantado el servicio.

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` | público — crea `CUSTOMER` |
| POST | `/auth/login` | público |
| POST | `/auth/refresh` | público (requiere refresh token válido) |
| POST | `/auth/logout` | público (requiere refresh token válido) |
| GET | `/auth/me` | autenticado |
| GET | `/tenants` | público |
| GET | `/tenants/:tenantSlug` | público |
| GET | `/tenants/with-counts` | SUPER_ADMIN |
| POST | `/tenants` | SUPER_ADMIN |
| PATCH | `/tenants/:tenantSlug` | TENANT_ADMIN o `TENANT_SETTINGS_MANAGE` |
| GET | `/shows/upcoming` | público |
| GET | `/shows/:id` | público |
| GET | `/tenants/:tenantSlug/shows` | público |
| POST | `/tenants/:tenantSlug/shows` | `SHOWS_MANAGE` |
| POST | `/tenants/:tenantSlug/shows/:showId/reservations` | público (checkout sin login, paridad con el flujo actual) |
| GET | `/tenants/:tenantSlug/reservations` | `RESERVATIONS_MANAGE` |
| GET/POST | `/tenants/:tenantSlug/shows/:showId/guests` | `GUEST_LIST_MANAGE` |
| PATCH | `/tenants/:tenantSlug/guests/:guestId` | `GUEST_LIST_MANAGE` |
| GET/POST | `/tenants/:tenantSlug/staff` | TENANT_ADMIN o SUPER_ADMIN |
| PATCH | `/tenants/:tenantSlug/staff/:userId/permissions` | TENANT_ADMIN o SUPER_ADMIN |
| DELETE | `/tenants/:tenantSlug/staff/:userId` | TENANT_ADMIN o SUPER_ADMIN (desactiva, no borra) |
| GET | `/health` | público (para Docker healthcheck / nginx) |

## Verificado en producción (VPS)

Levantado con `docker compose up -d postgres legado-api` en la VPS,
migración aplicada (`prisma migrate deploy`) y seedeado. Probado en vivo con
curl, todo funcionando como se diseñó:

- Login de las 4 cuentas de ejemplo (SUPER_ADMIN, TENANT_ADMIN, TENANT_STAFF,
  y un CUSTOMER recién registrado).
- `GET /tenants/with-counts` (SUPER_ADMIN): 200 con token, 401 sin token.
- Un `TENANT_ADMIN` (`romina@eltunel.com`) probó ver el staff de **otro**
  tenant → 403 (`TenantScopeGuard`); el suyo propio → 200.
- El `TENANT_STAFF` de ejemplo (permisos: sólo `GUEST_LIST_MANAGE` +
  `RESERVATIONS_MANAGE`) intentó crear un show (`SHOWS_MANAGE`) → 403;
  listó la lista de invitados → 200. Confirma que el recorte de permisos
  por sub-categoría funciona.
- `register` → `refresh` (rotación) → ambos devuelven tokens nuevos válidos.
- `/api/v1/docs` (Swagger) responde 200.

Un problema real que apareció y se corrigió en el camino: con
`NODE_ENV=production` seteado en la imagen, `npm install tsx` instalaba y
podaba el paquete en el mismo paso (npm lo trata como devDependency) — el
binario nunca llegaba a la imagen final aunque el log de build no mostraba
ningún error. Se resolvió con `npm install --no-save --include=dev tsx`
(ver `Dockerfile`).

## Migración de datos (SQLite → Postgres)

`scripts/migrate-sqlite-to-postgres.ts` — lee la SQLite vieja
(`node:sqlite`, mismo driver que usaba `src/lib/db.ts`) y hace upsert
idempotente en Postgres, preservando los IDs (para que URLs como `/el-tunel`
sigan funcionando).

```bash
SQLITE_PATH=/ruta/a/legado-cumbiero.db DATABASE_URL=postgresql://... npm run migrate:sqlite
```

**Importante — correr primero contra una copia, nunca contra el archivo
real directamente.** Es idempotente (upsert por id), así que se puede
re-correr sin problema si algo falla a mitad de camino.

**Limitación conocida**: la tabla `User` vieja era decorativa (sin
contraseña). Las cuentas migradas quedan como `TENANT_ADMIN` **inactivas**
(`isActive: false`) con una contraseña inutilizable — hay que resetearlas a
mano post-migración (son pocas cuentas por boliche, más simple que armar un
flujo de invitación completo para este volumen).

**Limitación conocida (constraint de email único)**: `User.email` es
`@unique` a nivel de todo el sistema (no por tenant) para que el login
funcione con un único campo email sin ambigüedad. Prisma todavía no soporta
índices únicos parciales en el DSL del schema — si en algún momento hace
falta reforzar unicidad condicional a nivel de base (más allá del
chequeo a nivel de aplicación que ya hace `AuthService`/`UsersService`),
se puede agregar a mano vía `prisma migrate dev --create-only` + editar el
SQL generado antes de aplicar.

## Qué falta (próximas etapas del plan)

- [x] Verificación en vivo contra un Postgres real — hecha en la VPS, ver
      "Verificado en producción" arriba.
- [x] `docker-compose.yml` (servicios `postgres` + `legado-api`),
      `api/Dockerfile`.
- [ ] Integración con Next.js: `/login`, `/registro`, sesión, cutover de
      `src/lib/db.ts` a esta API en todas las páginas.
- [ ] Nginx + certbot para `api.legadocumbiero.rmbcorp.com` — requiere que
      el usuario cree el registro DNS A apuntando a la VPS primero.
- [ ] Tests (unitarios de guards/servicios, e2e de auth).
