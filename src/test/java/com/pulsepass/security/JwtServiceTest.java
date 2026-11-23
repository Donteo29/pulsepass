package com.pulsepass.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {
    private static final String SECRET = Base64.getEncoder().encodeToString(
            "pulsepass-test-secret-with-at-least-32-bytes".getBytes(StandardCharsets.UTF_8));
    private static final String ISSUER = "pulsepass-api";
    private final PulsePassPrincipal user = new PulsePassPrincipal(
            42L, "andrea", "andrea@example.test", "hash", "USER", true);
    private final JwtService jwtService = new JwtService(SECRET, 900_000, ISSUER);

    @Test
    void tokenUsesPersistentUserIdAndConfiguredIssuer() {
        String token = jwtService.generateToken(user);

        assertThat(jwtService.extractSubject(token)).isEqualTo("42");
        assertThat(jwtService.isTokenValid(token, user)).isTrue();
        var claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET)))
                .requireIssuer(ISSUER)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        assertThat(claims.getIssuer()).isEqualTo(ISSUER);
        assertThat(claims.getExpiration()).isAfter(new Date());
    }

    @Test
    void tokenWithDifferentIssuerIsRejected() {
        String wrongIssuer = Jwts.builder()
                .issuer("not-pulsepass")
                .subject("42")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET)))
                .compact();

        assertThatThrownBy(() -> jwtService.extractSubject(wrongIssuer))
                .isInstanceOf(RuntimeException.class);
    }
}
