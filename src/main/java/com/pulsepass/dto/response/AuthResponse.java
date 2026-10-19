
package com.pulsepass.dto.response;

public record AuthResponse(
        String tokenType,
        String accessToken,
        long expiresInMs,
        String username,
        String role
) {
}
