# Checklist de ejecución E2E manual en Postman

## Preparación

- [ ] Usa una base local dedicada a la demostración; no uses producción.
- [ ] Inicia PostgreSQL y la API con una clave JWT Base64 aleatoria de 32 bytes o más.
- [ ] Comprueba GET /api/venues/active.
- [ ] Registra USER_A, USER_B, admin@pulsepass.local, staff@pulsepass.local e inactive@pulsepass.local por POST /api/users.
- [ ] Ejecuta fixtures-local.sql en la base local para crear la sede de prueba y asignar los roles.
- [ ] Importa la colección y `PulsePass.postman_environment.example.json`; completa credenciales y datos propios en el ambiente local de Postman.
- [ ] Deja tokens y passwords como variables locales secretas de Postman; no guardes sus valores en exports.

## Envío manual

- [ ] Envía POST /api/users individualmente para registrar USER_A y USER_B; valida 201, role USER y ausencia de hash.
- [ ] Envía POST /api/auth/login por separado para USER_A, USER_B, STAFF y ADMIN; copia cada accessToken manualmente a su variable local.
- [ ] Envía GET /api/auth/me para cada actor y compara identidad y roles.
- [ ] Envía las rutas públicas y comprueba que la información pública no incluye borradores.
- [ ] Crea, asocia artista y publica un evento con ADMIN; confirma el estado mediante una consulta posterior.
- [ ] Compra tickets con USER_A. Para cancelación y uso, utiliza tickets diferentes.
- [ ] Comprueba el rechazo de los accesos cruzados, compra con correo ajeno y permisos STAFF/ADMIN.
- [ ] Envía cada request mediante Send. No uses Collection Runner ni scripts.
- [ ] Inspecciona Status, Headers y Body; registra resultado y observación en bitacora-e2e.md.
- [ ] Marca omitidos como BLOCKED; nunca los declares PASS sin haberlos enviado y revisado.
- [ ] Revisa que bitácora, capturas y exports no incluyan contraseñas ni tokens.
