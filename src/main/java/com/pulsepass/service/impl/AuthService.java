
package com.pulsepass.service.impl;

import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.PulsePassPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final long expirationMs;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            @Value("${pulsepass.jwt.expiration-ms}") long expirationMs) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.expirationMs = expirationMs;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.identifier(),
                        request.password()
                )
        );

        PulsePassPrincipal principal =
                (PulsePassPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        return new AuthResponse(
                token,
                "Bearer",
                expirationMs / 1000
        );
    }
}
