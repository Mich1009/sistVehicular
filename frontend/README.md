# Frontend SIMV (React + Vite)

SPA para el Sistema Vehicular (SIMV), con rutas por rol y consumo de la API mediante `fetch`.

## Variables de Entorno
- `VITE_API_URL`: URL base del backend (ej. `http://localhost:3000`).

## Instalación
```bash
npm install
```

## Desarrollo
```bash
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Autenticación
- Al iniciar sesión se guarda `user` y `token` en `localStorage`.
- Todas las llamadas en `src/api/api.ts` agregan `Authorization: Bearer <token>` si existe.
- El dashboard redirige a `/` si no hay sesión.

## Estructura
- `src/pages/auth`: login/registro/recuperación.
- `src/pages/dashboard`: pantallas por rol (admin, técnico, almacén).
- `src/components`: layout, tablas y modales.
- `src/contexts/ThemeContext.tsx`: tema claro/oscuro con preferencia del sistema.
