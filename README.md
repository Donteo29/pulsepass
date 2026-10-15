# PulsePass

PulsePass es un proyecto academico de persistencia construido desde cero para representar venues, eventos, artistas, usuarios, perfiles y tickets usando Java 21, Spring Boot 4, JPA, PostgreSQL, Flyway y Testcontainers.

## Modelo

- `Venue` 1:N `Event`
- `Event` N:M `Artist` mediante `event_artists`
- `User` 1:1 `UserProfile`
- `User` 1:N `Ticket`
- `Event` 1:N `Ticket`

Los enums persistentes se almacenan como texto estable:

- `EventCategory`: `MUSIC`, `SPORTS`, `TECHNOLOGY`, `EDUCATION`, `CULTURE`, `ENTERTAINMENT`
- `EventStatus`: `DRAFT`, `PUBLISHED`, `SOLD_OUT`, `CANCELLED`, `FINISHED`
- `TicketType`: `GENERAL`, `VIP`, `BACKSTAGE`, `STUDENT`
- `TicketStatus`: `RESERVED`, `PAID`, `CANCELLED`, `USED`

## Migraciones

- `V1__create_schema.sql`: crea `venues`, `events`, `artists`, `event_artists`, `users`, `user_profiles` y `tickets` con PK, FK, UNIQUE, CHECK e indices.
- `V2__insert_initial_artists.sql`: inserta `Solar Beat`, `Neon Waves`, `Caribbean Sound`, `Ocean Drive` y `Digital Pulse`.
- `V3__add_streaming_url_to_event.sql`: agrega `streaming_url VARCHAR(500)` nullable a `events`.

Flyway es el responsable del esquema y Hibernate queda en modo `validate`.

## Repositories y consultas

Todos los repositories extienden `JpaRepository`:

- `VenueRepository`
- `EventRepository`
- `ArtistRepository`
- `UserRepository`
- `UserProfileRepository`
- `TicketRepository`

Las consultas simples usan query methods, incluyendo busqueda por codigos de negocio, estado, venue, usuario y ticket. Las consultas de descubrimiento y agregacion usan JPQL con `JOIN`, `DISTINCT` y `COUNT`.

## Pruebas

Las pruebas de integracion usan PostgreSQL real con Testcontainers. Para ejecutarlas:

```bash
mvn clean test
```

En esta maquina Maven tambien puede ejecutarse desde IntelliJ si no esta en el `PATH`:

```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.2\plugins\maven\lib\maven3\bin\mvn.cmd" clean test
```
