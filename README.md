# PulsePass

PulsePass es una aplicación académica para descubrir eventos, consultar artistas y sedes, registrar usuarios y administrar tickets. El proyecto integra una API REST con Java 21 y Spring Boot 4, PostgreSQL, Flyway, Spring Security y JWT; el cliente web usa React, TypeScript, React Router, TanStack Query, React Hook Form, Zod y Tailwind CSS.

## Requisitos

- JDK 21.
- Maven 3.9 o posterior disponible como comando **mvn**.
- Node.js 22.22 o posterior y npm.
- PostgreSQL 16 o posterior, o Docker Desktop con Docker Compose.
- Postman para ejecutar y documentar la validación manual requerida.

La copia que se debe abrir en IntelliJ y usar para los comandos es la carpeta raíz **pulsepass**, que contiene este README, **pom.xml**, **src** y **pulsepass-web**.

## Inicio local

### 1. Iniciar PostgreSQL

Desde la carpeta raíz del proyecto, inicia el contenedor local:

~~~powershell
docker compose up -d db
~~~

Compose crea una base local llamada **pulsepass**, con usuario y contraseña **pulsepass**, expuesta en el puerto 5432. Estos valores son exclusivamente para desarrollo local; no se deben reutilizar en un entorno publicado.

Si ya tienes PostgreSQL instalado, crea una base de datos **pulsepass** y un usuario con permisos sobre ella. Configura **PULSEPASS_DATASOURCE_URL**, **PULSEPASS_DATASOURCE_USERNAME** y **PULSEPASS_DATASOURCE_PASSWORD** en la terminal antes de iniciar la API.

### 2. Configurar una clave JWT local

En la misma terminal PowerShell donde iniciarás Spring Boot, genera una clave aleatoria de 32 bytes:

~~~powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$rng.Dispose()
$env:PULSEPASS_JWT_SECRET = [Convert]::ToBase64String($bytes)
~~~

La aplicación requiere **PULSEPASS_JWT_SECRET**: si no existe, Spring Boot no arranca. Genera una clave nueva en cada ventana PowerShell y ejecuta `mvn spring-boot:run` en esa misma ventana. No compartas ni guardes la clave en Git. Debe contener al menos 32 bytes antes de codificarla en Base64. La duración predeterminada del token es 900 segundos y el issuer es **pulsepass-api**.

Opcionalmente, define la conexión a PostgreSQL en la misma terminal:

~~~powershell
$env:PULSEPASS_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/pulsepass"
$env:PULSEPASS_DATASOURCE_USERNAME = "pulsepass"
$env:PULSEPASS_DATASOURCE_PASSWORD = "pulsepass"
~~~

### 3. Iniciar la API

Desde la raíz:

~~~powershell
mvn spring-boot:run
~~~

Flyway aplica automáticamente las cuatro migraciones. La aplicación escucha en **http://localhost:8080**. No ejecutes el comando en la carpeta **pulsepass-web**.

### 4. Iniciar el frontend

Abre otra terminal:

~~~powershell
cd .\pulsepass-web
npm ci
npm run dev
~~~

Vite muestra la dirección local, normalmente **http://localhost:5173**, y reenvía **/api** a **http://localhost:8080**. La variable opcional **VITE_API_BASE_URL** se documenta en **pulsepass-web/.env.example**.

## Comandos de verificación

Ejecuta desde la raíz:

~~~powershell
mvn clean test
~~~

Los tests de repositorio usan PostgreSQL real mediante Testcontainers y requieren Docker en ejecución. Las pruebas unitarias de servicios usan Mockito.

Ejecuta desde **pulsepass-web**:

~~~powershell
npm ci
npm run test
npm run lint
npm run build
~~~

**npm run test** ejecuta Vitest en modo no interactivo. **npm run lint** ejecuta Oxlint y **npm run build** valida TypeScript y genera la versión de producción.

### Resultado comprobado de esta entrega

- `mvn clean test`: 57 pruebas aprobadas, sin fallos ni errores; incluye PostgreSQL mediante Testcontainers.
- `npm run test`: 12 pruebas aprobadas.
- `npm run lint`: aprobado sin advertencias.
- `npm run build`: TypeScript y compilación de producción aprobados.
- Colección Postman: 22 solicitudes importables, sin scripts ni tokens guardados.

La ejecución manual individual en Postman aún debe registrarse en **postman/bitacora-e2e.md**. Las filas comienzan en **PENDING** y deben cambiarse solo después de enviar y revisar cada solicitud.

## API implementada

Todas las rutas usan el prefijo **/api**. Las respuestas de error usan **ErrorResponse** con **timestamp**, **status**, **error**, **message** y **details**.

| Método | Ruta | Acceso |
|---|---|---|
| GET | /venues/{code} | Público |
| GET | /venues/active | Público |
| POST | /events | ADMIN |
| GET | /events/{eventCode} | Público si está publicado; STAFF/ADMIN pueden consultar borradores |
| GET | /events/published | Público |
| PATCH | /events/{eventCode}/publish | ADMIN |
| POST | /events/{eventCode}/artists/{artistId} | ADMIN |
| GET | /events/by-artist?stageName=... | Público para eventos publicados; STAFF/ADMIN para otros estados |
| GET | /artists/{id} | Público |
| GET | /artists/by-stage-name?stageName=... | Público |
| GET | /artists/active | Público |
| POST | /users | Público; el registro asigna USER |
| GET | /users/by-email?email=... | Propietario o ADMIN |
| GET | /users/by-username?username=... | Propietario o ADMIN |
| POST | /tickets | USER; el correo debe ser el del principal |
| GET | /tickets/{ticketCode} | Propietario, STAFF o ADMIN |
| GET | /tickets/by-user?email=... | Propietario o ADMIN |
| GET | /events/{eventCode}/tickets/paid | STAFF o ADMIN |
| PATCH | /tickets/{ticketCode}/cancel | Propietario USER o ADMIN |
| PATCH | /tickets/{ticketCode}/use | STAFF o ADMIN |
| POST | /auth/login | Público |
| GET | /auth/me | Autenticado |

El JWT es stateless. El campo **sub** contiene el ID persistente del usuario; el token valida firma, issuer y expiración. La sesión del frontend conserva el token en **sessionStorage** y obtiene rol e identidad desde **/auth/me**.

## Usuarios locales para la demostración

Registra las cuentas mediante **POST /api/users** o la pantalla Crear cuenta. El endpoint público siempre crea cuentas con rol USER y guarda la contraseña con BCrypt. Para asignar STAFF o ADMIN en una base local de demostración, primero registra la cuenta correspondiente y luego ejecuta:

~~~powershell
psql -h localhost -p 5432 -U pulsepass -d pulsepass -f .\postman\fixtures-local.sql
~~~

El fixture solo modifica las cuentas con correo **admin@pulsepass.local**, **staff@pulsepass.local** e **inactive@pulsepass.local**; nunca contiene contraseñas. En Windows, si **psql** no está en PATH, ejecuta el binario instalado, por ejemplo **C:\Program Files\PostgreSQL\17\bin\psql.exe**, con los mismos argumentos. Usa esta preparación únicamente en una base local descartable.

## Postman y pruebas manuales

La colección importable y una plantilla de ambiente sin secretos están en **postman/**. La colección contiene las 20 operaciones de la API base y los dos endpoints de autenticación. No usa scripts de pre-request, post-response ni assertions automáticas, porque el PRD pide enviar y revisar cada solicitud manualmente.

1. Selecciona la base local de demostración y carga el fixture de venue.
2. Registra USER_A, USER_B, STAFF, ADMIN e INACTIVE_USER; asigna los roles locales con el fixture.
3. Importa **postman/PulsePass.postman_collection.json** y **postman/PulsePass.postman_environment.example.json**; Postman creará el ambiente **PulsePass Local**.
4. Completa las variables de credenciales, correos, códigos y actores solo en Postman. No exportes los valores secretos.
5. Envía cada request con **Send**; no uses Collection Runner.
6. Copia manualmente el token de cada login en la variable local del actor y verifica **/auth/me**.
7. Registra resultado observado, esperado y comentario en **postman/bitacora-e2e.md**. Los casos sin ejecutar permanecen **PENDING**; no se presentan como aprobados.

La bitácora incluida es una plantilla de ejecución, no evidencia de una sesión manual ya realizada. No exportes tokens ni contraseñas.

## Persistencia

Flyway mantiene el esquema versionado en **src/main/resources/db/migration**:

- V1 crea venues, eventos, artistas, usuarios, perfiles, tickets y sus relaciones.
- V2 inserta artistas iniciales.
- V3 agrega la URL de streaming al evento.
- V4 agrega el hash de contraseña y el rol de usuario.

Hibernate usa **ddl-auto=validate**; no edites migraciones que ya fueron aplicadas. Agrega cambios posteriores como nuevas migraciones.

## Estructura

- **src/main/java/com/pulsepass/entity**: entidades y enums JPA.
- **src/main/java/com/pulsepass/repository**: repositorios y consultas.
- **src/main/java/com/pulsepass/service**: interfaces y reglas de negocio.
- **src/main/java/com/pulsepass/controller**: endpoints REST y DTOs.
- **src/main/java/com/pulsepass/security**: autenticación JWT y autorización por propiedad.
- **src/test/java**: pruebas de repositorio, servicios, controladores y seguridad.
- **pulsepass-web/src**: SPA React y TypeScript.
- **postman**: colección, ambiente, fixtures locales y bitácora manual.

## Seguridad de configuración

**.env.example** contiene solo nombres de variables y valores ilustrativos. No guardes claves JWT, contraseñas reales, tokens ni credenciales de Postman en el repositorio. Las variables de Postman con secretos deben completarse localmente y excluirse de cualquier exportación compartida.
