# Implementación de useSessionTimeout para Rutas Restringidas

## Descripción

Esta implementación permite controlar el tiempo de sesión únicamente para aquellas URLs configuradas en `menuItems` que tienen estado 'R' (restringido).

## Archivos Modificados/Creados

### 1. `/src/core/utils/restrictedRoutes.ts`
Utilidad que extrae las rutas con estado 'R' de los menuItems.

**Funciones principales:**
- `getRestrictedRoutes(menuItems)`: Extrae todas las URLs con estado 'R'
- `isRestrictedRoute(currentPath, menuItems)`: Verifica si una ruta está restringida

### 2. `/src/hooks/useSessionTimeout.tsx` (Modificado)
Hook modificado para activarse solo en rutas restringidas.

**Cambios realizados:**
- Importa `usePathname` para obtener la ruta actual
- Importa `useMenuItems` para obtener la configuración del menú
- Verifica si la ruta actual está restringida antes de activar el timeout
- Solo monitorea actividad del usuario en rutas con estado 'R'

### 3. `/src/components/SessionTimeoutProvider.tsx`
Componente proveedor que encapsula la lógica del timeout de sesión.

### 4. `/src/app/layout.tsx` (Modificado)
Layout principal actualizado para incluir el `SessionTimeoutProvider`.

## Rutas Actualmente Restringidas

En CASA todas las rutas del panel (`/home`, `/afiliados`, `/pagos`, …) llevan estado 'R'. La página pública `/` y `/login` no.

## Cómo Funciona

1. **Monitoreo Universal de Actividad**: En TODAS las rutas, se monitorean los eventos de actividad del usuario:
   - `mousemove`
   - `keydown` 
   - `click`

2. **Actualización de Storage**: Cualquier actividad en cualquier ruta actualiza el `lastActivityTime` en localStorage.

3. **Verificación de Ruta**: Al cambiar de página, el hook verifica si la nueva ruta está en la lista de rutas restringidas.

4. **Control de Timeout Selectivo**: Solo en rutas con estado 'R' se activa el intervalo que verifica el timeout cada segundo.

5. **Timeout**: Si no hay actividad durante 30 minutos (`NEXT_PUBLIC_SESSION_TIMEOUT_INACTIVITY_TIMEOUT_MINUTES`) y el usuario está en una ruta restringida, es redirigido a `/login`.

6. **Limpieza**: Al cambiar de ruta, se limpian automáticamente todos los event listeners y se detiene el intervalo de verificación si existía.

## Configuración

### Agregar Nueva Ruta Restringida
Para agregar una nueva ruta al control de timeout:

1. En `/src/shared/layouts/menuItems.ts`, cambiar el `status` del elemento a `"R"`:
```typescript
{ 
  text: 'Nueva Funcionalidad', 
  url: '/nueva-ruta', 
  icon: NuevoIcon, 
  status: "R"  // Cambiar de "A" a "R"
}
```

### Modificar Tiempo de Timeout
Cambiar `NEXT_PUBLIC_SESSION_TIMEOUT_INACTIVITY_TIMEOUT_MINUTES` en `.env.local` (y en Vercel). `src/core/utils/sessionTimeout.ts` lo lee desde `ENV`.

## Ventajas de esta Implementación

1. **Monitoreo Universal**: Todas las rutas actualizan la actividad del usuario en localStorage
2. **Control Selectivo**: Solo las rutas con estado 'R' aplican el timeout de sesión
3. **Configurable**: Fácil agregar/quitar rutas del control de timeout
4. **Eficiente**: El intervalo de verificación solo se ejecuta en rutas restringidas
5. **Consistente**: La actividad se registra independientemente de la ruta actual
6. **Mantenible**: Centralizada en la configuración de menuItems
7. **Escalable**: Funciona con estructura anidada de menús

## Uso

La implementación se activa automáticamente al incluir el `SessionTimeoutProvider` en el layout principal. No requiere configuración adicional en componentes individuales.