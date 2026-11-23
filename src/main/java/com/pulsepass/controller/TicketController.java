package com.pulsepass.controller;

import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.service.TicketService;
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

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@Validated
public class TicketController {
    private final TicketService ticketService;
    private final UserService userService;
    private final AuthorizationService authorizationService;

    public TicketController(
            TicketService ticketService,
            UserService userService,
            AuthorizationService authorizationService) {
        this.ticketService = ticketService;
        this.userService = userService;
        this.authorizationService = authorizationService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> purchase(
            @Valid @RequestBody PurchaseTicketRequest request,
            @AuthenticationPrincipal PulsePassPrincipal principal) {
        authorizationService.requireOwnPurchase(principal, request.userEmail());
        return ResponseEntity.status(201).body(ticketService.purchase(request));
    }

    @GetMapping("/{ticketCode}")
    public ResponseEntity<TicketResponse> findByCode(
            @PathVariable String ticketCode,
            @AuthenticationPrincipal PulsePassPrincipal principal) {
        TicketResponse ticket = ticketService.findByCode(ticketCode);
        authorizationService.requireTicketRead(principal, ticket.userEmail());
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/by-user")
    public ResponseEntity<List<TicketResponse>> findByUserEmail(
            @RequestParam @NotBlank(message = "Email is required")
            @Email(message = "Email must be valid") String email,
            @AuthenticationPrincipal PulsePassPrincipal principal) {
        authorizationService.requireTicketList(
                principal, userService.findByEmail(email).id());
        return ResponseEntity.ok(ticketService.findByUserEmail(email));
    }

    @PatchMapping("/{ticketCode}/cancel")
    public ResponseEntity<TicketResponse> cancel(
            @PathVariable String ticketCode,
            @AuthenticationPrincipal PulsePassPrincipal principal) {
        authorizationService.requireTicketCancellation(
                principal, ticketService.findByCode(ticketCode).userEmail());
        return ResponseEntity.ok(ticketService.cancel(ticketCode));
    }

    @PatchMapping("/{ticketCode}/use")
    public ResponseEntity<TicketResponse> markAsUsed(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.markAsUsed(ticketCode));
    }
}
