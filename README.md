# Legado Cumbiero

Plataforma **multi-tenant** de venta/reserva de entradas para boliches de
cumbia. Cada boliche ("tenant") tiene, dentro de la misma app, su propio
line-up de shows, lista de invitados, reservas de entradas y panel de
administración — sin mezclarse con los datos de los demás. Un panel maestro
adicional permite dar de alta nuevos boliches y ver un resumen de todos.

Este documento describe el alcance actual (v1 / MVP), cómo está armado el
proyecto por dentro (front, back, base de datos, lógica de negocio) y qué
falta para llevarlo a producción real, para que se pueda seguir
desarrollando sin tener que releer todo el código de cero.

---

## 1. Alcance de esta versión (v1 / MVP)

**Lo que SÍ hace hoy:**

- Un home público (`/`) que lista todos los boliches y los próximos shows de
  todos ellos, con buscador por fecha y por boliche.
- Página pública de cada boliche (`/[tenant]`) con su identidad visual
  (color de marca, amenities, próximos shows) y botón a Google Maps.
- Reserva de entradas sin pago real (`/[tenant]/reservar`): el cliente pone
  cantidad, nombre y WhatsApp, y la reserva queda registrada como
  "confirmada".
- Panel de administración por boliche (`/[tenant]/admin`): métricas rápidas,
  alta de shows con su line-up de artistas, listado de reservas y alta /
  cambio de estado de la lista de invitados.
- Panel maestro (`/master`): alta de nuevos boliches (tenant) con su color de
  marca y amenities, y resumen de shows/reservas/invitados de cada uno.
- Diseño propio (neón / disco de los 2000, ver sección 6) replicado en
  desktop y mobile.

**Lo que NO hace todavía (a propósito, fuera de alcance de esta v1):** ver
sección 7 ("Qué falta para producción").

---

## 2. Stack técnico

| Capa | Tecnología | Motivo |
|---|---|---|
| Framework | **Next.js 15** (App Router) + **React 18** + **TypeScript** | SSR + Server Actions en un solo proyecto, sin backend separado |
| Estilos | **Tailwind CSS** + fuente "Baloo 2" (Google Fonts) | look bold/redondeado del mockup de marca |
| Base de datos | **`node:sqlite`** (módulo nativo de Node 22+, `DatabaseSync`) | ver nota abajo |
| Mutaciones | **Server Actions** de Next (`"use server"`) | sin API REST separada |
| Contenedor | **Docker** (multi-stage, `node:22-bookworm-slim`) | deploy junto a otros sitios dockerizados detrás de nginx |

**¿Por qué `node:sqlite` y no Prisma/Postgres?** Se arrancó con Prisma, pero
el entorno de desarrollo donde se armó esta v1 bloquea la descarga del
binario del motor de Prisma. Se migró a `node:sqlite` (built-in en Node
22+, sin instalar nada ni compilar módulos nativos) para no depender de eso.
Es un módulo experimental de Node pero estable para uso normal. **Para
producción en serio, ver la sección 7** — la recomendación es migrar a
Postgres.

---

## 3. Arquitectura

No hay API REST ni backend separado: **todo vive en el mismo proyecto
Next.js**.

- Las páginas (`src/app/**/page.tsx`) son **Server Components**: leen datos
  directo de `src/lib/db.ts` en el servidor, sin pasar por `fetch`.
- Las mutaciones (crear reserva, agregar invitado, crear show, crear tenant)
  son **Server Actions** en `src/lib/actions.ts`, invocadas directamente
  desde los `<form action={...}>` del cliente. Next serializa la llamada,
  la ejecuta en el servidor y revalida (`revalidatePath`) las páginas que
  dependen de esos datos.
- El aislamiento multi-tenant es **lógico, no físico**: todas las tablas
  tienen `tenantId` y cada query lo filtra explícitamente. Todos los
  boliches comparten el mismo archivo SQLite.
- No hay autenticación todavía (ver sección 7): `/[tenant]/admin` y
  `/master` son de acceso libre por URL.

```
Browser
  │
  ▼
Next.js App Router (SSR)
  ├─ Server Components (src/app/**/page.tsx)  ──► lectura ──► src/lib/db.ts
  └─ Server Actions   (src/lib/actions.ts)     ──► escritura ─► src/lib/db.ts
                                                                    │
                                                                    ▼
                                                     data/legado-cumbiero.db (SQLite)
```

---

## 4. Modelo de datos (`src/lib/db.ts`)

Todas las tablas se crean automáticamente al levantar la app (`CREATE TABLE
IF NOT EXISTS` en `getDb()`), no hay migraciones separadas todavía.

| Tabla | Campos clave | Qué representa |
|---|---|---|
| **Tenant** | `id`, `slug` (único, usado en la URL), `name`, `city`, `description`, `accentColor`, `amenities` (string separado por comas) | Un boliche. Es la raíz del aislamiento multi-tenant. |
| **User** | `id`, `tenantId`, `name`, `email` (único por tenant), `role` | Usuario de un boliche (staff/admin). Existe en el modelo pero **todavía no hay login** — el seed carga alguno, pero no se usa para autenticar. |
| **Artist** | `id`, `tenantId`, `name`, `genre` | Artista/DJ que puede tocar en shows de ese boliche. |
| **Show** | `id`, `tenantId`, `title`, `date`, `capacity`, `ticketPrice` | Un evento/fecha de un boliche. |
| **ShowArtist** | `id`, `showId`, `artistId`, `slotTime` | Tabla intermedia: line-up de un show (qué artistas tocan). |
| **GuestListEntry** | `id`, `tenantId`, `showId`, `name`, `plusOnes`, `status` (`pendiente`/otros) | Lista de invitados de un show (entrada sin cobrar). |
| **Reservation** | `id`, `tenantId`, `showId`, `customerName`, `customerPhone`, `quantity`, `status` (`confirmada`) | Reserva de entrada hecha por un cliente vía `/[tenant]/reservar`. |

Todas las tablas de datos de un boliche (`User`, `Artist`, `Show`,
`GuestListEntry`, `Reservation`) referencian `tenantId`; nunca se cruzan
entre boliches en ninguna query.

`src/lib/db.ts` expone funciones ya armadas para lectura (`listTenantsWithNextShow`,
`listUpcomingShowsAll`, `getTenantWithShows`, `getShowWithLineup`,
`listTenantsWithCounts`) y escritura (`createTenant`, `createShowWithArtists`,
`createReservation`, `createGuest`, `updateGuestStatus`, `resetAndSeed`) — las
páginas y las Server Actions sólo llaman a estas funciones, nunca arman SQL
por su cuenta.

---

## 5. Rutas y lógica de negocio

| Ruta | Tipo | Qué hace |
|---|---|---|
| `/` | pública | Home: hero, buscador (fecha + boliche), próximos shows de **todos** los boliches (`listUpcomingShowsAll`) y grilla de boliches (`listTenantsWithNextShow`). |
| `/eventos` | pública | Listado completo de shows futuros, mismo buscador que el home. |
| `/boliches` | pública | Listado de boliches con buscador por nombre/ciudad. |
| `/[tenant]` | pública | Página de un boliche: header con su `accentColor`, amenities, botón "Ver mapa" (Google Maps con `city`/`name`), próximos shows. 404 si el `slug` no existe. |
| `/[tenant]/reservar?show=<id>` | pública | Formulario de reserva → `createReservationAction`. Valida nombre y WhatsApp obligatorios, cantidad mínima 1; redirige a `/[tenant]?reservado=1` al confirmar. |
| `/[tenant]/admin` | **sin login** | Panel del boliche: métricas (shows/reservas/invitados vía `listTenantsWithCounts`), alta de show + line-up (`createShowAction`, artistas separados por coma), listado de reservas, alta de invitado (`addGuestAction`) y cambio de estado (`updateGuestStatusAction`). |
| `/master` | **sin login** | Panel maestro: alta de boliche nuevo (`createTenantAction` — genera el `slug` automáticamente a partir del nombre, con sufijo numérico si ya existe) y resumen de todos los tenants. |
| `/reservas`, `/perfil` | stub | Quedan preparadas para cuando haya login de cliente (ver sección 7). |

Todas las mutaciones siguen el mismo patrón: `Server Action` recibe
`FormData` → valida lo mínimo → resuelve el `tenantId` a partir del
`tenantSlug` recibido → llama a `src/lib/db.ts` → `revalidatePath` de las
páginas afectadas.

---

## 6. Diseño / front-end

- Paleta neón sobre fondo oscuro (rosa/amarillo/cian/violeta) inspirada en
  la estética cumbia de los 2000, tomada de un mockup de marca provisto por
  el cliente.
- **`src/components/DiscoScene.tsx`**: escena de disco (bola de espejos,
  haces de luz, siluetas bailando) dibujada 100% en SVG — se usa en vez de
  fotos reales del lugar, que todavía no existen. Se tiñe con el
  `accentColor` de cada tenant, así cada boliche mantiene su identidad
  dentro de la misma plataforma.
- Cada boliche tiene su propio `accentColor` (guardado en `Tenant`), que se
  aplica al header, la escena de disco y el botón "Reservar" de ese tenant.
- **Mobile**: `BottomTabBar` (navegación inferior fija: Inicio/Eventos/
  Boliches/Reservas/Perfil), `MobileMenu` (hamburguesa), `FavoriteButton`
  (♡ en la cabecera de un boliche) y chips de filtro rápido en Eventos.
- Componentes reutilizables en `src/components/`: `TopNav`, `EventCard`,
  `TenantCard`, `QuantityStepper` (selector +/- de cantidad en la reserva).
- Cuando haya fotos reales del lugar/eventos, `DiscoScene` se reemplaza por
  una imagen real en `EventCard`, `TenantCard` y la página de un tenant —
  el resto del diseño no depende de eso.

---

## 7. Qué falta para producción (a propósito fuera de esta v1)

Esto es lo próximo a encarar, en orden sugerido de prioridad:

1. **Autenticación y roles reales.** Hoy `/[tenant]/admin` y `/master` son
   de acceso libre por URL — cualquiera que sepa el link puede administrar.
   Es lo primero a resolver antes de exponer esto públicamente en serio:
   login por tenant, roles admin/staff (la tabla `User` ya existe pero no
   se usa para autenticar todavía), y proteger `/master` a nivel de
   super-admin de la plataforma.
2. **Pagos.** La reserva no cobra de verdad (queda "confirmada" sin cobrar
   nada). Integrar un medio de pago — Mercado Pago es la opción natural
   para Argentina.
3. **Base de datos productiva.** Hoy todos los tenants comparten un único
   archivo SQLite (`data/legado-cumbiero.db`), sin backups automáticos ni
   alta concurrencia. Para escalar en serio: migrar a **Postgres** (un
   esquema por tenant, o `tenantId` + Postgres con Row Level Security), y
   agregar migraciones versionadas (hoy el schema se crea con `CREATE TABLE
   IF NOT EXISTS` directo en el código, sin historial de cambios).
4. **Notificaciones.** Confirmación de reserva por email o WhatsApp (hoy no
   se envía nada, solo queda guardado en la base).
5. **App nativa.** Esta v1 es web responsive. El mismo backend (Server
   Actions se pueden exponer como API REST si hace falta) sirve de base
   para una app nativa o Capacitor más adelante.
6. **Tests automatizados.** Hoy no hay suite de tests; la verificación se
   hizo manualmente con Playwright durante el desarrollo, pero no quedó
   como suite corriendo en CI.

---

## 8. Cómo correrlo en local

Requiere **Node 22+** (por `node:sqlite`).

```bash
npm install
npm run seed     # carga 4 boliches de ejemplo con shows, reservas y listas
npm run dev      # http://localhost:3000
```

Datos de ejemplo cargados por `npm run seed` (editable en `scripts/seed.ts`,
o directamente desde `/master` con boliches reales):

- **El Túnel** (La Plata, rosa) — 3 shows, con reservas y lista de invitados.
- **K'mina Club** (La Plata, amarillo) — 1 show.
- **El Galpón** (Berisso, cian) — 1 show.
- **Bunker** (Ensenada, violeta) — 1 show.

---

## 9. Deploy con Docker (VPS)

Pensado para correr junto a otros sitios dockerizados detrás de nginx, sin
tocar lo que ya está andando en el servidor.

- **`Dockerfile`**: build multi-stage (`deps` → `builder` → `runner`) sobre
  `node:22-bookworm-slim`. La imagen final corre el build `output:
  "standalone"` de Next (`node server.js`) y además incluye `tsx` +
  `scripts/seed.ts` + `src/lib/db.ts`, para poder cargar los datos de
  ejemplo dentro del contenedor ya desplegado con `npm run seed`, sin tener
  que generar ni copiar un `.db` a mano.
- **`docker-compose.yml`**: define el servicio con un volumen
  (`legado-cumbiero-data` → `/app/data`) para que la base SQLite persista
  entre redeploys/reinicios. Trae comentadas las dos variantes típicas de
  exposición hacia nginx:
  - **nginx-proxy + acme-companion** (si el VPS usa ese patrón): se
    descomentan las env vars `VIRTUAL_HOST`/`LETSENCRYPT_HOST` y se conecta
    el servicio a la red de ese proxy — sin tocar ningún archivo de config,
    el proxy detecta el contenedor solo y pide el SSL automáticamente.
  - **nginx propio (host o dockerizado) + certbot manual**: se descomenta
    el mapeo de puerto (`127.0.0.1:<puerto>:3000`) y se agrega un server
    block de nginx que haga proxy a ese puerto, más `certbot --nginx` para
    el certificado.

```bash
docker compose build
docker compose up -d
docker compose exec legado-cumbiero npm run seed
```

### Estado actual del deploy

Desplegado en un VPS que ya corre otros sitios dockerizados (nginx real del
host + certbot, sin `nginx-proxy`/`traefik`). El contenedor expone
`127.0.0.1:3050:3000` y nginx (host) tiene un server block propio para
**`legadocumbiero.rmbcorp.com`** que hace proxy a ese puerto, con SSL vía
`certbot --nginx`. Los demás contenedores/sitios del VPS no se tocaron.

---

## 10. Estructura del proyecto

```
legado-cumbiero/
├── Dockerfile                  # build multi-stage para producción
├── docker-compose.yml          # servicio + volumen + notas de nginx
├── next.config.js              # output: "standalone"
├── package.json                # scripts: dev / build / start / seed
├── scripts/
│   └── seed.ts                 # carga los 4 boliches de ejemplo
├── public/
│   └── logo.png                # logo real de la marca
└── src/
    ├── app/
    │   ├── page.tsx                       # home (/)
    │   ├── eventos/page.tsx                # /eventos
    │   ├── boliches/page.tsx               # /boliches
    │   ├── reservas/page.tsx               # stub
    │   ├── perfil/page.tsx                 # stub
    │   ├── master/page.tsx                 # panel maestro (/master)
    │   ├── [tenant]/
    │   │   ├── page.tsx                    # página pública del boliche
    │   │   ├── admin/page.tsx              # panel del boliche
    │   │   └── reservar/page.tsx           # formulario de reserva
    │   ├── layout.tsx
    │   └── globals.css
    ├── components/
    │   ├── TopNav.tsx / MobileMenu.tsx / BottomTabBar.tsx
    │   ├── DiscoScene.tsx                  # escena SVG de disco
    │   ├── EventCard.tsx / TenantCard.tsx
    │   ├── QuantityStepper.tsx / FavoriteButton.tsx
    ├── lib/
    │   ├── db.ts                           # capa de datos (node:sqlite)
    │   └── actions.ts                      # Server Actions (mutaciones)
    └── types/
        └── node-sqlite.d.ts                # tipos ambiente para node:sqlite
```

---

## 11. Convenciones para seguir desarrollando

- Toda lectura de datos nueva va como función en `src/lib/db.ts` (no armar
  SQL suelto en un `page.tsx`).
- Toda mutación nueva va como Server Action en `src/lib/actions.ts`, con
  `revalidatePath` de las rutas que dependen de ese dato.
- Cualquier tabla/función nueva debe llevar `tenantId` y filtrar por él —
  es la única barrera de aislamiento entre boliches que existe hoy.
- Antes de agregar autenticación real, tener en cuenta que `/[tenant]/admin`
  y `/master` hoy asumen que quien llega ya está autorizado — hay que
  envolverlas con el chequeo de sesión/rol en cuanto se implemente login.
