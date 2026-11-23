-- Fixture exclusivamente local para una base de demostración PulsePass.
-- Registra antes las cuentas por POST /api/users para que BCrypt genere sus hashes.
-- No contiene contraseñas ni tokens. No ejecutar en producción.
\set ON_ERROR_STOP on

BEGIN;

INSERT INTO venues (code, name, city, address, capacity, active)
VALUES ('VEN-SMR-01', 'Marina Convention Center', 'Santa Marta',
        'Carrera 1 # 22-45', 500, TRUE)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    capacity = EXCLUDED.capacity,
    active = TRUE;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE lower(email) = 'admin@pulsepass.local') THEN
        RAISE EXCEPTION 'Registra primero admin@pulsepass.local mediante POST /api/users';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE lower(email) = 'staff@pulsepass.local') THEN
        RAISE EXCEPTION 'Registra primero staff@pulsepass.local mediante POST /api/users';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM users WHERE lower(email) = 'inactive@pulsepass.local') THEN
        RAISE EXCEPTION 'Registra primero inactive@pulsepass.local mediante POST /api/users';
    END IF;
END $$;

UPDATE users SET role = 'ADMIN', active = TRUE
WHERE lower(email) = 'admin@pulsepass.local';
UPDATE users SET role = 'STAFF', active = TRUE
WHERE lower(email) = 'staff@pulsepass.local';
UPDATE users SET role = 'USER', active = FALSE
WHERE lower(email) = 'inactive@pulsepass.local';

COMMIT;
