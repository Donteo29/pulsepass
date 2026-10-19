
package com.pulsepass.service.impl;

import com.pulsepass.dto.request.LoginRequest;
import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.entity.User;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final long expirationMs;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService,
            @Value("${pulsepass.jwt.expiration-ms}") long expirationMs) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.expirationMs = expirationMs;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.login(),
                        request.password()
                )
        );

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user was not found"
                ));

        String token = jwtService.generateToken(
                (org.springframework.security.core.userdetails.UserDetails)
                        authentication.getPrincipal()
        );

        return new AuthResponse(
                "Bearer",
                token,
                expirationMs,
                user.getUsername(),
                user.getRole()
        );
    }
}
