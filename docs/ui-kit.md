# UI Kit — forma, color y controles

Fuente de verdad visual del frontend. Si el código contradice este documento,
el código es deuda: no se “normaliza” la violación copiándola.

Reglas prescriptivas: `docs/prompts/2_architecture_rules.md` (sección UI).
Identidad / rebranding: `docs/BRANDING.md`.

---

## 1. Principio de familia visual

La plantilla es **redondeada**. Eso no es un detalle estético puntual: es el
contrato de forma de toda la UI.

- Botones de acción: **píldora** (`border-radius: 9999px`).
- Campos de formulario: **cápsula** (`20px`).
- Cards / papeles / modales de contenido: **16px** (24px si es una card hero).
- Indicadores / avatares / steps: **círculo** (`50%`).

**Prohibido** dejar un control de la misma familia con esquinas a 90°
(`border-radius: 0` o el default cuadrado de MUI/PrimeReact). Un botón píldora
junto a un botón rectangular se lee como error de implementación, no como variante.

`border-radius: 0` solo es válido en superficies **a sangre** (drawer de pantalla
completa, sidebar colapsado pegado al borde).

---

## 2. Escala de radio (usar estos valores, no inventar)

| Token conceptual | Valor      | Uso |
|------------------|------------|-----|
| `none`           | `0`        | Solo full-bleed: drawer mobile, sidebar colapsado |
| `sm`             | `8px`      | Adornos internos, icon buttons compactos de soporte |
| `md`             | `12px`     | Chips, badges. **No** para botones CTA |
| `lg`             | `16px`     | Cards, papers, paneles de tabla, modales de contenido |
| `field`          | `20px`     | Inputs, selects, date, password, textarea |
| `xl`             | `24px`     | Cards destacadas (login) |
| `pill`           | `9999px`   | Botones de acción (primary / secondary / ghost) |
| `circle`         | `50%`      | Status dots, step icons, avatares |

Cuando se agreguen tokens de radio a `src/styles/designTokens.ts`, estos nombres
son los canónicos.

---

## 3. Botones

### 3.1 Contrato

Fuente: `src/styles/components/buttonStyles.ts`, aplicado globalmente a
`MuiButton` en `src/styles/theme.ts`.

Todo botón de acción DEBE:

- Usar `theme.customButtons.primary` | `secondary` | `ghost`.
- O el componente `HoverIconButton` / `RippleHoverButton` (ya nacen píldora).
- Medir **44px** de alto (sm = 36, lg = 52).
- Tipografía **Roboto Medium 14px**, `textTransform: none`, sin sombra.
- `borderRadius: 9999px` — no pisar este valor en `sx` salvo `sm`/`lg` de altura.

Variantes:

| Variante     | Apariencia                                      | Cuándo |
|--------------|-------------------------------------------------|--------|
| `primary`    | Fondo marca, texto blanco                       | Acción principal (guardar, confirmar, login) |
| `secondary`  | Outline marca, fondo transparente               | Acción alternativa (cancelar, volver) |
| `ghost`      | Outline texto, fondo transparente               | Terciario / destructivo suave |
| `sm` / `lg`  | Misma forma, otra altura                        | Densidad; se combinan con la variante |

Aliases deprecados (no usar en código nuevo): `orange` (= secondary),
`buttonContent` (= primary).

### 3.2 Cómo escribir un botón

```tsx
import HoverIconButton from '@/shared/ui/mui/HoverIconButton';

<HoverIconButton
  text="Guardar"
  type="submit"
  sx={theme.customButtons.primary}
  onClick={onSave}
/>

<Button sx={theme.customButtons.secondary} onClick={onCancel}>
  Cancelar
</Button>
```

### 3.3 Prohibido

- `<Button variant="contained">` / `outlined` / `text` **sin** `theme.customButtons.*`.
- `borderRadius: 0`, `4px`, `8px` o `12px` en un CTA (rompe la píldora).
- Botones PrimeReact (`p-button`) para acciones de pantalla; el kit de acción es MUI.
- Icon-only cuadrados para acciones primarias: usar `HoverIconButton` o un
  `IconButton` con radio `circle` / `sm`, nunca el default cuadrado.

### 3.4 Deuda actual (no copiar)

- `src/features/login/view/Login.tsx` pisa el login a `borderRadius: "12px"`.
  El estándar es píldora; esa excepción se debe eliminar, no replicar.
- `ConfirmRecordActionModal` mezcla `Button` + `HoverIconButton` (aceptable
  mientras ambos lleven `customButtons`).

---

## 4. Color

### 4.1 Fuente de verdad

`src/styles/designTokens.ts` → `colors`.

Consumir así:

```ts
import { colors } from '@/styles/designTokens';
// o, en componentes MUI ya temáticos:
theme.palette.primary.main
```

**No** pegar hex de marca (`#1E5631`, `#1A4A2A`, …) en JSX/CSS nuevo.
Si el token no existe, se agrega en `designTokens.ts` y luego se usa.

### 4.2 Paleta

`brand` sale de `NEXT_PUBLIC_BRAND_COLOR` (ver `docs/BRANDING.md`). Los tokens
marcados como *derivado* se calculan de él en `src/styles/brandColor.ts`; los
hex de la tabla son los del valor por defecto.

| Token                    | Hex       | Rol |
|--------------------------|-----------|-----|
| `brand`                  | `#1E5631` | Primario, CTA, foco (parámetro) |
| `brandPress`             | `#1A4A2A` | Active del CTA (derivado) |
| `brandHover`             | `#3F3F3F` | Hover del CTA (gris oscuro, no un tono más claro del primario) |
| `brandDisabled`          | `#F1F1F1` | Fondo disabled |
| `brandUnselected`        | `#C3C3C3` | No seleccionado |
| `brandBg`                | `#E9EEEA` | Hover de secondary, ítem activo del menú (derivado) |
| `brandTint`              | primario al 12% | Hover de menú y selects (derivado) |
| `brandShadow` / `brandShadowStrong` | primario al 35% / 40% | Sombra del CTA de login (derivado) |
| `textPrincipal`          | = `brand` | Títulos de marca |
| `textBody`               | `#1A1A1A` | Cuerpo |
| `textSecondary`          | `#999999` | Apoyo |
| `textPositive`           | `#FFFFFF` | Texto sobre marca |
| `surface0`–`surface3`    | blanco → gris | Superficies |
| `success` / `warning` / `error` / `info` | ver tokens | Semántica |

Estados semánticos traen trío `color` + `*Bg` + `*Text` para chips y banners.

### 4.3 Un solo origen del primario

`palette.ts` y las variables CSS (`--color-primary`, `--color-focus-input`,
`--color-brand-*`) se derivan de `colors`: `src/styles/cssVariables.ts` las
inyecta en `<html>`. Los hex de `variables.css` son solo respaldo. Para cambiar
el primario basta con `NEXT_PUBLIC_BRAND_COLOR`; no se edita CSS.

Neutros del shell: objeto `chrome` en `designTokens.ts` (`headerBg`,
`sidebarBg`, `sidebarText`, `canvasBg`, …).

### 4.4 Tipografía

- UI general y títulos: **Poppins** 400/500/600/700 (`src/styles/typography.ts`, `globals.css`).
- Botones: **Roboto Medium** (contrato de `buttonStyles`).
- No introducir una tercera familia.

Escala (`fontSizes` en `designTokens.ts`, base 14px). No usar `px` sueltos:

| Token | Tamaño | Uso |
|-------|--------|-----|
| `xs`  | 12px | Captions, ayudas de campo |
| `sm`  | 13px | Texto secundario, migas (`body2`) |
| `md`  | 14px | Cuerpo (`body1`), menú, campos, botones |
| `lg`  | 16px | Cuerpo destacado, nombre en el header |
| `xl`  | 18px | Título de pantalla / card (`h4`) |
| `h3`  | 20px | Sección |
| `h2`  | 24px | Título de página grande |
| `h1`  | 28px | Landing / hero |

Pesos: `fontWeights` (400 / 500 / 600 / 700). Íconos del shell: `iconSizes`
(18 / 20 / 24px).

---

## 5. Campos de formulario

Altura canónica: **45px**. Radio: **20px** (`uniformFieldHeight`).

Usar los wrappers de `src/shared/ui/mui/`, no `TextField` / `Select` crudos:

| Necesidad            | Componente |
|----------------------|------------|
| Texto / número       | `InputFieldMUI` |
| Password             | `PasswordFieldMUI` |
| Fecha                | `DateFieldMUI` |
| Select               | `SelectFieldMUI` / `SelectWithSearchFieldMUI` |
| Multi-select         | `MultiSelectFieldMUI` / `MultiSelectWithSearchFieldMUI` |
| Textarea             | `TextAreaFieldMUI` |
| Checkbox / radio     | `CheckboxFieldMUI`, `CheckboxGroupFieldMUI`, `RadioButtonFieldMUI` |

Estilos de layout de form: `theme.customStyleForm` (`fullContainer2`,
`grid3md` / `grid6md` / `grid12md`, `uniformFieldHeight`).

**Prohibido** `theme.customStyleForm.uniformFieldHeight3` en código nuevo:
fuerza `borderRadius: 0` y viola este kit.

Foco: borde 2px `brand`. Error: borde 2px `palette.error.main`. Hover de
select: fondo `brand` al 10% de opacidad.

---

## 6. Tablas

- Listas de negocio: `DatatableLocal` (datos en cliente) o `DatatableApi`
  (paginación servidor) en `src/shared/ui/primereact/Datatable/`.
- Panel de tabla: radio `lg` (16px), no cajas cuadradas.
- Acciones de fila: menú `MoreVert` + `ConfirmRecordActionModal`; no botones
  rectangulares sueltos en cada celda.
- Export Excel ya viene en el datatable; no reimplementar.

No usar los archivos `*Original.tsx` ni `DatatableApi - para build.tsx` en
features nuevas (son copias de trabajo).

---

## 7. Modales

- Siempre `AppDialog` (cierra con X / Escape / botones; **no** con click en backdrop).
- Confirmaciones de registro: `ConfirmRecordActionModal`.
- Mensajes globales: `CustomMessageModal` (ya montado en root).
- z-index: `src/shared/layout/appShellConstants.ts` (`APP_MODAL_Z_INDEX`, etc.).
- Acciones del pie: `customButtons.secondary` (cancelar) + `primary` (confirmar),
  ambos píldora.

---

## 8. Layout / shell

- Header + sidebar: `app/(panel)/layout.tsx`.
- Shell neutro: el primario es acento, no relleno.
  - Header: fondo blanco, texto `chrome.headerText`, línea inferior de 2px en `brand`.
  - Sidebar: fondo `chrome.sidebarBg` con borde; franja del logo en blanco.
  - Ítem activo: fondo `brandBg`, texto `brand`, barra lateral de 3px en `brand`.
  - Contenido: fondo `chrome.canvasBg`.
- Menú: texto 14px, íconos 20px (subítems 18px), alto 44px; todos los ítems con ícono.
- Login: fondo `palette.primary.main`, sin shell.
- Ítems de menú expandido: radio `15px` (familia redondeada). Colapsado: `0`
  porque el ítem pega al borde (excepción `none` legítima).
- Logo: `BrandLogo` + `appConfig.assets` (monograma si no hay archivo). Copy: `appConfig`, nunca nombres de producto hardcodeados.
- Íconos del header: `src/config/appIcons.ts`.

---

## 9. Checklist rápido al construir una pantalla

- [ ] Botones con `theme.customButtons.*` o `HoverIconButton` (píldora 44px)
- [ ] Campos con wrappers `shared/ui/mui` (radio 20px, alto 45px)
- [ ] Colores desde `colors` / `theme.palette`, no hex sueltos
- [ ] Tamaños de letra desde `fontSizes` / variantes de `Typography`, no `px` sueltos
- [ ] Cards/tablas con radio ≥ 16px
- [ ] Cero `borderRadius: 0` en controles interactivos
- [ ] Modal vía `AppDialog`
- [ ] Sin inventar un botón, input o tabla “solo para esta pantalla”
