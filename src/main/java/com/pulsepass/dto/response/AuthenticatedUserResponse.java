package com.pulsepass.dto.response;

import java.util.List;

public record AuthenticatedUserResponse(
        Long identifier,
        String username,
        String email,
        List<String> roles
) {
    public AuthenticatedUserResponse {
        roles = List.copyOf(roles);
    }
}
