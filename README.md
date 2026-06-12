# DPP Vela Textile — Demo UX/UI

Prueba técnica UX/UI de un módulo de **Pasaporte Digital de Producto (DPP)** textil para la marca **Vela Textile / TraceWeave**.

## Objetivo

Interfaz para que un Supply Manager (usuario no técnico) pueda revisar, cargar, validar y publicar la información documental de un producto textil, cumpliendo con los requisitos del **Reglamento de Diseño Ecológico para Productos Sostenibles (ESPR)** de la UE.

## Secciones del DPP

| Sección | Descripción |
|---|---|
| **Resumen** | Dashboard con puntaje de completitud, métricas clave y tareas pendientes |
| **Producto** | Datos básicos del producto, operador responsable, QR/URL pública |
| **Cadena de suministro** | Trazabilidad, certificaciones (GOTS, GRS, OEKO-TEX) y auditorías |
| **Materiales** | Composición, tratamientos químicos y control REACH/SVHC |
| **Circularidad** | Durabilidad, impacto ambiental, reciclabilidad y puntos de recogida |
| **Cumplimiento** | Checklists REACH, CSRD/ESRS, EUDR, ESPR |
| **Central de documentación** | Gestión documental: carga, reemplazo, eliminación y estados |

## Tecnologías

- **Next.js 16** (App Router, static export)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS 4**
- **i18next** (ES/EN)
- **Chart.js** (gráficos)
- **Leaflet** (mapas)
- **QRCode.react**

## Requisitos

- Node.js >= 18
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). La app redirige al dashboard.

## Build

```bash
npm run build
```

Genera una exportación estática en la carpeta `dist/`.

## Vista previa del build

```bash
npx serve dist/
```

## Deploy

El build estático (`dist/`) puede desplegarse en cualquier hosting estático:

- **Vercel** (compatible nativo con Next.js)
- **Netlify** (solo carpeta `dist/`)
- **GitHub Pages** (requiere configurar `basePath` en `next.config.ts`)
- **Cualquier servidor HTTP** (Nginx, S3, etc.)

## Demo

Los datos son **mock** y corresponden al producto `VT-CAM-001` (Camiseta Unisex Algodón Orgánico). No hay backend ni base de datos real.

Estados documentales:
- **Vigente** — documentación cubierta
- **Por vencer** — documentación próxima a vencer
- **Pendiente** — documentación no cargada
- **Vencido** — documentación vencida
