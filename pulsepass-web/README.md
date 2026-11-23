# PulsePass Web

Aplicación de una sola página para PulsePass, desarrollada con React, TypeScript estricto, Tailwind CSS v4 y React Router. Las páginas usan TanStack Query para los datos de servidor, React Hook Form y Zod para los formularios, y un cliente HTTP único para validar respuestas.

## Requisitos

- Node.js 22.22 o posterior.
- npm.
- La API PulsePass en http://localhost:8080 para el uso integrado.

## Desarrollo

Desde esta carpeta:

~~~powershell
npm ci
npm run dev
~~~

Vite muestra la URL local y reenvía las solicitudes /api a http://localhost:8080. La configuración predeterminada está en vite.config.ts. Para cambiar la base, copia .env.example como .env.local y define VITE_API_BASE_URL.

## Verificación

~~~powershell
npm run test
npm run lint
npm run build
~~~

Vitest ejecuta pruebas de componentes y flujos; Testing Library verifica lo que ve y hace una persona; MSW simula la API en la capa de red. Oxlint revisa el código y el build comprueba TypeScript antes de generar dist.

## Organización

- src/pages/: páginas de inicio, catálogo, detalles, cuenta, tickets, staff y administración.
- src/layouts/: navegación y guardas de sesión y rol.
- src/funcionalidades/: esquemas, llamadas y operaciones por dominio.
- src/lib/http.ts: fetch, Bearer token, validación Zod y errores HTTP normalizados.
- src/componentes/: controles y estados visuales reutilizables.
- src/test/: configuración, handlers MSW y pruebas.

## Sesión y seguridad

El login envía identifier y password a /api/auth/login; después consulta /api/auth/me para cargar identidad y rol desde el servidor. El token queda en memoria y sessionStorage, solo viaja en Authorization: Bearer, y se elimina al expirar o recibir 401. No se utiliza localStorage.

Las guardas de rutas solo mejoran la navegación. La API vuelve a validar todos los permisos, la propiedad de los recursos y las reglas de negocio.
