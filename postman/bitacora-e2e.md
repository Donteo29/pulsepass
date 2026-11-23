# Bitácora de ejecución manual PulsePass

Estado inicial de todas las filas: **PENDING**. Esta plantilla no declara casos aprobados. Ejecuta cada solicitud individualmente desde Postman y completa el resultado observado, observación y referencia de evidencia sin copiar credenciales ni tokens.

- Fecha de ejecución:
- Responsable:
- Commit / versión:
- Base E2E usada:
- API base:
- Colección: PulsePass - API local (22 rutas)
- Ambiente: PulsePass Local

## 22 rutas base

| ID | Método y ruta | Actor | Esperado | Observado | Estado (PASS/FAIL/BLOCKED) | Observación / evidencia sin secretos |
|---|---|---|---|---|---|---|
| E2E-VEN-01 | GET /api/venues/{code} | Anónimo | 200; sede existente | Pendiente | PENDING | |
| E2E-VEN-02 | GET /api/venues/active | Anónimo | 200; solo sedes activas | Pendiente | PENDING | |
| E2E-EVT-01 | POST /api/events | ADMIN | 201; estado DRAFT | Pendiente | PENDING | |
| E2E-EVT-02 | GET /api/events/{eventCode} | Anónimo / USER / STAFF | Publicado 200; borrador oculto al público y USER | Pendiente | PENDING | |
| E2E-EVT-03 | GET /api/events/published | Anónimo | 200; sin borradores | Pendiente | PENDING | |
| E2E-EVT-04 | PATCH /api/events/{eventCode}/publish | ADMIN | 200; PUBLISHED persistido | Pendiente | PENDING | |
| E2E-EVT-05 | POST /api/events/{eventCode}/artists/{artistId} | ADMIN | 200; asociación persistida | Pendiente | PENDING | |
| E2E-EVT-06 | GET /api/events/by-artist?stageName=... | Anónimo / STAFF | Público solo publicados; STAFF puede ver estados operativos | Pendiente | PENDING | |
| E2E-ART-01 | GET /api/artists/{id} | Anónimo | 200; artista existente | Pendiente | PENDING | |
| E2E-ART-02 | GET /api/artists/by-stage-name?stageName=... | Anónimo | 200 | Pendiente | PENDING | |
| E2E-ART-03 | GET /api/artists/active | Anónimo | 200; solo activos | Pendiente | PENDING | |
| E2E-USR-01 | POST /api/users | Anónimo | 201; rol USER y sin hash en respuesta | Pendiente | PENDING | |
| E2E-USR-02 | GET /api/users/by-email?email=... | USER_A / USER_B | Propio 200; ajeno 403/404 | Pendiente | PENDING | |
| E2E-USR-03 | GET /api/users/by-username?username=... | USER_A / USER_B | Propio 200; ajeno 403/404 | Pendiente | PENDING | |
| E2E-TKT-01 | POST /api/tickets | USER_A | 201 propio; compra ajena denegada sin mutación | Pendiente | PENDING | |
| E2E-TKT-02 | GET /api/tickets/{ticketCode} | Propietario / otro USER / STAFF | Propio 200; ajeno denegado; staff autorizado | Pendiente | PENDING | |
| E2E-TKT-03 | GET /api/tickets/by-user?email=... | USER_A / USER_B | Propio 200; ajeno 403/404 | Pendiente | PENDING | |
| E2E-TKT-04 | GET /api/events/{eventCode}/tickets/paid | STAFF / USER | STAFF 200; USER 403 | Pendiente | PENDING | |
| E2E-TKT-05 | PATCH /api/tickets/{ticketCode}/cancel | Propietario / ADMIN | 200 si Service permite; ajeno denegado | Pendiente | PENDING | |
| E2E-TKT-06 | PATCH /api/tickets/{ticketCode}/use | STAFF / USER | STAFF 200; USER 403 | Pendiente | PENDING | |
| E2E-AUTH-01 | POST /api/auth/login | USER_A / USER_B / STAFF / ADMIN | 200 Bearer, expiresIn=900; error genérico para contraseña incorrecta | Pendiente | PENDING | |
| E2E-AUTH-02 | GET /api/auth/me | USER_A / STAFF / ADMIN | 200 identidad y roles; sin datos sensibles | Pendiente | PENDING | |

## Casos negativos complementarios

| Caso | Esperado | Observado | Estado | Observación / evidencia sin secretos |
|---|---|---|---|---|
| Login anónimo con contraseña incorrecta | 401 y ErrorResponse genérico | Pendiente | PENDING | |
| Ruta protegida sin token | 401 y ErrorResponse | Pendiente | PENDING | |
| JWT expirado o alterado | 401; sin datos internos | Pendiente | PENDING | |
| USER crea o publica evento | 403; Service no se ejecuta | Pendiente | PENDING | |
| USER consulta borrador | 404 conforme a política anti-enumeración | Pendiente | PENDING | |
| USER consulta perfil o ticket ajeno | 403/404; sin exposición de datos | Pendiente | PENDING | |
| USER compra con correo ajeno | 403; 0 tickets añadidos | Pendiente | PENDING | |
| USER accede a tickets pagados o marca ticket como usado | 403 | Pendiente | PENDING | |
| Request inválido | 400 con ErrorResponse.details | Pendiente | PENDING | |
| Recurso ausente | 404 con ErrorResponse | Pendiente | PENDING | |
| Regla de negocio o duplicado | 409 con ErrorResponse | Pendiente | PENDING | |

## Cierre

- Rutas base ejecutadas: 0 / 22.
- Casos negativos ejecutados: 0.
- PASS:
- FAIL:
- BLOCKED:
- Defectos registrados:
- Confirmación: los tokens y contraseñas no están en la bitácora ni en evidencias exportadas.
