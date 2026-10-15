CREATE TABLE venues (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(250) NOT NULL,
    capacity INTEGER NOT NULL,
    active BOOLEAN NOT NULL,
    CONSTRAINT chk_venues_capacity_positive CHECK (capacity > 0)
);

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    event_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(180) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    category VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    minimum_age INTEGER NOT NULL,
    venue_id BIGINT NOT NULL,
    CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES venues (id),
    CONSTRAINT chk_events_category CHECK (category IN ('MUSIC', 'SPORTS', 'TECHNOLOGY', 'EDUCATION', 'CULTURE', 'ENTERTAINMENT')),
    CONSTRAINT chk_events_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'))
);

CREATE TABLE artists (
    id BIGSERIAL PRIMARY KEY,
    stage_name VARCHAR(120) NOT NULL UNIQUE,
    country VARCHAR(80) NOT NULL,
    genre VARCHAR(80) NOT NULL,
    active BOOLEAN NOT NULL
);

CREATE TABLE event_artists (
    event_id BIGINT NOT NULL,
    artist_id BIGINT NOT NULL,
    PRIMARY KEY (event_id, artist_id),
    CONSTRAINT fk_event_artists_event FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    CONSTRAINT fk_event_artists_artist FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE CASCADE
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(180) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL
);

CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(40),
    city VARCHAR(100),
    birth_date DATE NOT NULL,
    user_id BIGINT NOT NULL UNIQUE,
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(30) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_tickets_event FOREIGN KEY (event_id) REFERENCES events (id),
    CONSTRAINT chk_tickets_price_non_negative CHECK (price >= 0),
    CONSTRAINT chk_tickets_type CHECK (type IN ('GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT')),
    CONSTRAINT chk_tickets_status CHECK (status IN ('RESERVED', 'PAID', 'CANCELLED', 'USED'))
);

CREATE INDEX idx_events_venue_id ON events (venue_id);
CREATE INDEX idx_events_status_event_date ON events (status, event_date);
CREATE INDEX idx_events_event_date ON events (event_date);
CREATE INDEX idx_event_artists_artist_id ON event_artists (artist_id);
CREATE INDEX idx_tickets_user_id ON tickets (user_id);
CREATE INDEX idx_tickets_event_id ON tickets (event_id);
CREATE INDEX idx_tickets_status_event_id ON tickets (status, event_id);
