package com.pulsepass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final long expirationMs;
    private final String issuer;

    public JwtService(
            @Value("${pulsepass.jwt.secret}") String secret,
            @Value("${pulsepass.jwt.expiration-ms}") long expirationMs,
            @Value("${pulsepass.jwt.issuer:pulsepass-api}") String issuer) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException(
                    "JWT secret must contain at least 32 bytes."
            );
        }
        if (expirationMs <= 0) {
            throw new IllegalArgumentException(
                    "JWT expiration must be greater than zero."
            );
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
        this.issuer = issuer;
    }

    public String generateToken(PulsePassPrincipal principal) {
        Date issuedAt = new Date();
        return Jwts.builder()
                .issuer(issuer)
                .subject(principal.getUserId().toString())
                .issuedAt(issuedAt)
                .expiration(new Date(issuedAt.getTime() + expirationMs))
                .signWith(signingKey)
                .compact();
    }

    public String extractSubject(String token) {
        return parse(token).getPayload().getSubject();
    }

    public boolean isTokenValid(String token, PulsePassPrincipal principal) {
        Claims claims = parse(token).getPayload();
        return principal.getUserId().toString().equals(claims.getSubject())
                && issuer.equals(claims.getIssuer());
    }

    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(parse(token).getPayload());
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token);
    }
}
