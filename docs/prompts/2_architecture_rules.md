# ARCHITECTURE RULES — CONTRATO PRESCRIPTIVO (CASA)

Este documento es el único dueño de reglas prescriptivas “DEBE/NO DEBE”.
El detalle ilustrado (tablas, ejemplos, checklist) vive en `docs/architecture.md`,
`docs/ui-kit.md`, `docs/shared-components.md` y `docs/conventions.md`.
Las decisiones que justifican estas reglas están en `docs/decisions/`.

---

## 1) Reglas de capas

### 1.1 Dependencias permitidas
- `view` DEBE depender de `viewmodel`, `shared`, `styles`, `config`.
- `viewmodel` DEBE depender de `domain`, stores de `core`, router y theme. NO DEBE importar `HttpRequestProvider` ni Axios.
- `domain` (frontend) DEBE depender de `data` (repositorios), tipos y, si hace falta previsualizar, de `src/rules`. NO DEBE importar React/JSX, MUI ni Prisma.
- `data` PUEDE depender de `core/network`. NO DEBE importar views ni viewmodels. NO DEBE filtrar detalles de transporte hacia arriba.
- `shared` y `core` NO DEBEN importar `features`, `server` ni `app`.
- `app/(panel)` y `app/page.tsx` DEBEN limitarse a montar views, metadata y shell.
- `app/api/**/route.ts` DEBE limitarse a: sesión, permiso, validación de entrada y llamada a un servicio de `src/server`.
- `src/server` PUEDE depender de `src/rules` y de Prisma. NO DEBE importar `features`, `shared`, `core` ni React.
- `src/rules` NO DEBE importar nada del proyecto, ni React, Prisma, fetch o variables de entorno.

### 1.2 Ubicación de responsabilidades
- Las fórmulas de cuota, primera cuota reducida, estado, recargo, total y elegibilidad de beneficios DEBEN existir una sola vez, en `src/rules`.
- El valor que se guarda en la base DEBE calcularlo el servidor. El cliente PUEDE calcular el mismo valor solo para mostrarlo antes de confirmar.
- `src/rules` NO DEBE leer la hora del sistema: "hoy" DEBE entrar como parámetro, calculado en `America/Bogota`.
- `data` DEBE ser la única capa del cliente que habla con `/api`.
- Servicios de `src/server/modules` DEBEN abrir la transacción, aplicar las reglas y escribir la bitácora en las operaciones de `docs/REQUERIMIENTOS.md` sección 12.
- Repositorios de servidor DEBEN contener solo consultas Prisma, sin reglas ni permisos.
- `viewmodel` DEBE poseer estado de UI, handlers y navegación.
- `view` DEBE renderizar usando el kit compartido.
- `shared` DEBE contener solo controles/hooks usados (o de uso inmediato) en más de un feature.

### 1.3 Ownership de tipos (anti-duplicación)
- Tipos de negocio del frontend DEBEN vivir en `features/<nombre>/domain`.
- Tipos de entrada de la API DEBEN derivarse de los esquemas Zod de `src/server/modules/<modulo>/<modulo>.schema.ts`.
- Tipos de `src/rules` DEBEN declararse en el mismo archivo de la regla.
- Tipos de tema MUI DEBEN vivir en `src/types/mui.d.ts`. Contratos de menú, en `src/types/menu.ts`.
- NO DEBE duplicarse un componente shared “por si acaso” dentro del feature.

### 1.4 Localización
- Copy de UI y mensajes de error de la API que ve el usuario DEBEN estar en español.
- Identificadores, archivos, hooks, modelos Prisma, rutas de API, claves de permiso y comentarios DEBEN estar en inglés.
- Rutas de pantalla PUEDEN estar en español (`/afiliados`), porque el usuario las ve.

---

## 2) Reglas de feature

### 2.1 Estructura
- Un feature de frontend DEBE crear `data/`, `domain/`, `viewmodel/` y `view/`.
- Un módulo con datos DEBE crear además `src/server/modules/<modulo>/` (schema, repository, service) y sus `route.ts`.
- La ruta de pantalla DEBE ser una página delgada en `src/app/(panel)/<ruta>/page.tsx` (o `src/app/page.tsx` para la pública).
- El ítem de menú DEBE registrarse en `src/shared/layouts/menuItems.ts` con el permiso que lo habilita.
- SEO DEBE registrarse en `src/core/seo/seoMetadata.ts` cuando la ruta sea pública.

### 2.2 Feature de referencia
- El esqueleto a copiar DEBE ser `src/features/ejemplo`.
- El flujo de sesión DEBE ser `src/features/login`.

### 2.3 Estado de registros
- Activo/inactivo de catálogos en la UI DEBE usarse como `'A'` / `'I'`. El mapeo desde la API DEBE ocurrir en `data/`.
- Los estados de negocio (`MemberStatus`, `FeeStatus`) NO DEBEN forzarse a `'A'`/`'I'`.
- Confirmaciones de mutación de fila DEBEN usar `ConfirmRecordActionModal`.
- Datos de negocio NO DEBEN borrarse físicamente: se desactivan, se retiran o se anulan.

---

## 3) API, sesión y secretos

### 3.1 I/O del cliente
- Toda llamada del cliente DEBE vivir en repositorios (`data/`) y usar `HttpRequestProvider`.
- View, viewmodel y domain NO DEBEN importar clientes HTTP, URLs ni payloads crudos.
- NO DEBEN usarse Server Actions para casos de uso. El contrato entre cliente y servidor es `/api` (ADR-003).

### 3.2 Sesión y permisos
- El login DEBE ser correo y clave contra `POST /api/auth/login` (ADR-002).
- La sesión DEBE viajar solo en la cookie HttpOnly `casa_session`. NO DEBE guardarse un token en `localStorage`, `sessionStorage` ni en la UI.
- `useUserStore` PUEDE guardar datos no sensibles del usuario (nombre, correo, rol, permisos) para pintar la UI.
- Cada `route.ts` que lee o escribe datos DEBE exigir sesión y el permiso de la acción con `requirePermission`. Ocultar un botón NO DEBE considerarse control de acceso.
- Los permisos DEBEN leerse de la base en cada petición, no del JWT.
- Credenciales incorrectas DEBEN responder 400. El 401 queda reservado para sesión ausente o vencida.
- Las claves DEBEN guardarse con hash `bcryptjs`.
- `middleware.ts` DEBE redirigir a `/login` las rutas del panel sin cookie válida.

### 3.3 Servidor
- Todo archivo de `src/server` DEBE importar `server-only`.
- Toda entrada de la API DEBE validarse con Zod antes de llegar al servicio.
- Errores de la API DEBEN tener la forma `{ message, errors? }`.
- El esquema de base DEBE cambiar solo por migraciones de Prisma versionadas (ADR-004).
- Dinero: pesos en enteros. Porcentajes en `Decimal`. NO DEBE usarse `number` con decimales para montos.

### 3.4 Secretos
- El repo NO DEBE versionar secretos ni `.env.local`.
- Variables secretas NO DEBEN llevar prefijo `NEXT_PUBLIC_`.
- Logs, toasts y ejemplos NO DEBEN incluir claves, cookies ni credenciales.

---

## 4) Reglas de UI (forma, color, controles)

Esta sección es tan vinculante como las de capas. Ver `docs/ui-kit.md`.

### 4.1 Familia visual (redondeada)
- La UI DEBE ser redondeada de forma consistente.
- Botones de acción DEBEN ser píldora (`border-radius: 9999px`).
- Campos de formulario DEBEN usar radio `20px` y altura `45px`.
- Cards, papers, paneles de tabla y drawers DEBEN usar radio ≥ `16px` en su borde visible.
- Indicadores de estado, avatares y step icons DEBEN ser círculo (`50%`).
- NO DEBE usarse `border-radius: 0` (ni el default cuadrado de MUI/PrimeReact) en botones, inputs, chips, paginadores o cards.
- `border-radius: 0` SOLO DEBE usarse en superficies a sangre (drawer full-viewport, ítem de sidebar colapsado contra el borde).
- NO DEBE mezclarse un CTA píldora con un CTA rectangular en la misma pantalla o flujo.

### 4.2 Botones
- Todo botón de acción DEBE usar `theme.customButtons.primary | secondary | ghost` y/o `HoverIconButton` / `RippleHoverButton`.
- NO DEBE usarse `<Button variant="contained|outlined|text">` sin esos estilos.
- NO DEBE pisarse el `borderRadius` del CTA a `0`, `4`, `8` o `12` en `sx`.
- NO DEBE usarse `p-button` de PrimeReact para acciones de pantalla.
- Alto canónico DEBE ser 44px (sm 36 / lg 52). `textTransform` DEBE ser `none`.

### 4.3 Color
- Colores de marca y semánticos DEBEN salir de `src/styles/designTokens.ts` (`colors`) o de `theme.palette`.
- NO DEBE pegarse el hex de marca (`#1E5631`, `#1A4A2A`, `#E9EEEA`) en JSX/CSS nuevo.
- Un estado (Pendiente, Moroso, Pagado, Activo…) NO DEBE comunicarse solo con color: DEBE llevar texto.
- NO DEBE introducirse una tercera familia tipográfica. UI: Poppins. Botones: Roboto Medium.

### 4.4 Campos
- Inputs/selects/fechas/checkbox DEBEN ser los wrappers de `src/shared/ui/mui/`.
- NO DEBE usarse `TextField` / `Select` MUI crudos en features nuevas si existe wrapper.
- NO DEBE usarse `theme.customStyleForm.uniformFieldHeight3` en código nuevo (fuerza radio 0).
- Código nuevo de formulario NO DEBE basarse en `src/shared/components/*Field` legacy.

### 4.5 Tablas y modales
- Listados de negocio DEBEN usar `DatatableLocal` o `DatatableApi`.
- Modales DEBEN usar `AppDialog` (sin cierre por backdrop).
- Pie de modal: cancelar = `secondary`, confirmar = `primary`, ambos píldora.

### 4.6 Shared primero
- Antes de crear un control, DEBE buscarse en `docs/shared-components.md`.
- Un componente entra a `shared` SOLO si se usa (o se usará de inmediato) en más de un feature.
- Identidad (nombre, logos, tagline) DEBE pasar por `appConfig`, no por strings de producto hardcodeados.

---

## 5) Estado y side-effects
- Estado de usuario/sesión DEBE vivir en `useUserStore` / `useSessionStore`.
- NO DEBE crearse un store Zustand nuevo para un dato que ya está en esos stores.
- TanStack Query PUEDE usarse para cache de lecturas; NO DEBE mezclarse con fetches ad-hoc al mismo recurso.

---

## 6) Logging
- `console.error` PUEDE usarse para fallos inesperados.
- NO DEBEN loguearse claves, cookies, hashes ni datos personales de afiliados (documento, teléfono, dirección).

---

## 7) Violaciones: obligación de reporte
Ante una violación detectada, el asistente DEBE:
- explicar el problema
- explicar el impacto
- proponer una solución
- mostrar un ejemplo mínimo de corrección (capa correcta + kit visual correcto)

---

## Constraint Layer
Estas reglas no son sugerencias. Son constraints obligatorios.

- Ningún agente puede violarlas, ignorarlas o modificarlas implícitamente.
- Si una solicitud requiere violarlas:
  1. advertir la violación
  2. explicar el conflicto
  3. proponer alternativas compatibles
- Solo el System Architect puede proponer cambiarlas mediante ADR.
