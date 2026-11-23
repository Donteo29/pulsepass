
package com.pulsepass.controller;

import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.AuthenticatedUserResponse;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.security.PulsePassPrincipal;
import com.pulsepass.service.impl.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUserResponse> me(
            Authentication authentication) {
        if (authentication == null
                || !(authentication.getPrincipal() instanceof PulsePassPrincipal principal)) {
            throw new AuthenticationCredentialsNotFoundException("Authenticated user is unavailable");
        }
        return ResponseEntity.ok(new AuthenticatedUserResponse(
                principal.getUserId(),
                principal.getUsername(),
                principal.getEmail(),
                List.of(principal.getRole())
        ));
    }
}
