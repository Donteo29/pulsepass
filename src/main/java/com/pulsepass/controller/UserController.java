package com.pulsepass.controller;

import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.service.UserService;
import com.pulsepass.security.AuthorizationService;
import com.pulsepass.security.PulsePassPrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
    private final UserService userService;
    private final AuthorizationService authorizationService;

    public UserController(
            UserService userService,
            AuthorizationService authorizationService) {
        this.userService = userService;
        this.authorizationService = authorizationService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        return ResponseEntity.status(201).body(userService.register(request));
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> findByEmail(
            @RequestParam @NotBlank(message = "Email is required")
            @Email(message = "Email must be valid") String email,
            @AuthenticationPrincipal PulsePassPrincipal principal) {
        UserResponse user = userService.findByEmail(email);
        authorizationService.requireUserOrAdmin(principal, user.id());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/by-username")
    public ResponseEntity<UserResponse> findByUsername(
            @RequestParam @NotBlank(message = "Username is required") String username,
            @AuthenticationPrincipal PulsePassPrincipal principal) {
        UserResponse user = userService.findByUsername(username);
        authorizationService.requireUserOrAdmin(principal, user.id());
        return ResponseEntity.ok(user);
    }
}
