# Usuarios y roles

- Requerimiento: REQUERIMIENTOS.md §6, §9.5–§9.7, §10.8, §9.13 (bitácora), §13 módulo 3
- Estado: listo (código y pruebas). Recorrido con sesión real pendiente: sin cookie el panel redirige a `/login` y las API responden 401.

## Qué resuelve

El personal con permiso administra usuarios y roles. Un usuario inactivo no entra y no se borra. Los roles de sistema Administrador y Operativo no se desactivan ni se eliminan; sus permisos sí se pueden ajustar.

## Pantallas

- `/usuarios` — `users.view` para entrar. `users.manage` para crear, editar, activar, inactivar y asignar clave. Sin ese permiso la tabla no muestra acciones.
- `/roles` — `roles.view` para entrar y ver las casillas de permisos (solo lectura). `roles.manage` para crear, editar permisos y activar o inactivar roles que no son de sistema.

La clave no se vuelve a mostrar. Asignarla deja `mustChangePassword = true`.

## API

- `GET /api/users` — `users.view`. Usuarios (sin `passwordHash`) y los roles `{ id, name, isActive, isSystem }` para el formulario. Ese listado no exige `roles.view`.
- `POST /api/users` — `users.manage`. Crea con clave de al menos 8 caracteres y `mustChangePassword = true`. 409 si el correo ya existe o el rol está inactivo.
- `PATCH /api/users/[id]` — `users.manage`. Edita nombre, correo, rol, estado o asigna clave. 409 si la persona intenta desactivarse o quitarse el rol Administrador.
- `GET /api/roles` — `roles.view`. Roles con sus `permissionIds`.
- `POST /api/roles` · `PATCH /api/roles/[id]` — `roles.manage`. El alta siempre crea un rol con `isSystem = false`. 409 si el nombre ya existe, si se desactiva un rol de sistema o si se le cambia el nombre.
- `GET /api/permissions` — `roles.view`. Catálogo fijo, ordenado por módulo. No se edita desde la pantalla.

No hay `DELETE`. Sin sesión las cuatro lecturas responden 401.

## Datos

Sin migración. Usa `User`, `Role`, `Permission` y `RolePermission` de `0001_init`. La asignación de permisos reemplaza filas de `role_permissions`; el rol no se borra.

Bitácora, en la misma transacción que la escritura:

- `user.create`, `user.update`, `user.deactivate`, `user.role_change`, `user.password_reset`
- `role.permissions_change` al crear un rol o cuando cambian sus permisos, su nombre, su descripción o su estado. El detalle trae antes/después y `permissionsChanged`.

La clave y el hash no entran en el detalle.

## Reglas aplicadas

No hay fórmulas nuevas en `src/rules`.

- Correo único, en minúsculas. Clave de 8 a 72 caracteres.
- Al crear o al asignar clave, `mustChangePassword = true`.
- Un rol inactivo no se asigna. Quien ya lo tiene lo conserva.
- Nadie se desactiva a sí mismo ni se quita el rol de sistema Administrador. Otro administrador sí puede desactivar a un colega: la garantía de §6 es esa protección sobre la sesión propia.
- Administrador y Operativo (`isSystem`) no se desactivan ni cambian de nombre. Sus permisos sí.

## Decisiones

- Dos features (`users`, `roles`) y dos módulos de servidor, alineados con las rutas de §5.5.
- El alta deja el registro activo. Activar e inactivar usa la confirmación de `DatatableLocal` (`ConfirmRecordActionModal`).
- La confirmación de la clave es solo de pantalla. La API recibe la clave una vez.
- `GET /api/users` incluye los roles asignables para no exigir `roles.view` al administrar usuarios.
- El nombre de los roles de sistema no se edita, para que «Administrador» siga identificando la regla de no quitarse ese rol.
- Sin Excel: §10.10 no lista estas tablas. La búsqueda es el filtro de columnas de `DatatableLocal`.

## Verificación

- [x] lint (`npm run lint`, Node 22.23.3)
- [x] test: `users.schema.test.ts`, `users.service.test.ts` (clave con hash, sin secreto en la bitácora, autodesactivación, quitarse Administrador, bitácora separada), `usersService.test.ts`; `roles.schema.test.ts`, `roles.service.test.ts` (rol de sistema, permisos, 409 por nombre), `rolesService.test.ts`
- [x] API sin sesión: `GET /api/users`, `/api/roles` y `/api/permissions` responden 401
- [ ] recorrido en navegador con sesión: feliz, lista vacía, error, sin permiso y 403. `/usuarios` sin cookie redirige a `/login`. Misma deuda de `ADMIN_*` que el módulo 2
- [x] checklist UI en código: `DatatableLocal`, campos `shared/ui/mui`, botones `customButtons`, `AppDialog`, papers 16px, estado con texto
- [x] auditoría: sin CRITICAL ni MAJOR

## Cómo retomar

El índice está en `docs/features/README.md`. Siguiente módulo: **4 Perfiles y catálogo de beneficios**. No reabrir este módulo salvo un bug o el recorrido con sesión.
