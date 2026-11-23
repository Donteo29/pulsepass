package com.pulsepass.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

@Component
public class AuthorizationService {
    private static final Set<String> OPERATIONS_ROLES = Set.of("STAFF", "ADMIN");

    public boolean canViewUnpublished(PulsePassPrincipal principal) {
        return hasRole(principal, "STAFF") || hasRole(principal, "ADMIN");
    }

    public void requireUserOrAdmin(PulsePassPrincipal principal, Long ownerId) {
        requireAuthenticated(principal);
        if (hasRole(principal, "ADMIN")) return;
        if (!hasRole(principal, "USER")
                || ownerId == null
                || !ownerId.equals(principal.getUserId())) {
            throw new AccessDeniedException("You are not allowed to access this user.");
        }
    }

    public void requireTicketRead(PulsePassPrincipal principal, String ownerEmail) {
        requireAuthenticated(principal);
        if (hasOperationsRole(principal)) return;
        requireOwner(principal, ownerEmail);
    }

    public void requireTicketList(PulsePassPrincipal principal, Long ownerId) {
        requireAuthenticated(principal);
        if (hasRole(principal, "ADMIN")) return;
        if (!hasRole(principal, "USER")
                || ownerId == null
                || !ownerId.equals(principal.getUserId())) {
            throw new AccessDeniedException("You are not allowed to access these tickets.");
        }
    }

    public void requireTicketCancellation(
            PulsePassPrincipal principal,
            String ownerEmail) {
        requireAuthenticated(principal);
        if (hasRole(principal, "ADMIN")) return;
        requireOwner(principal, ownerEmail);
    }

    public void requireOwnPurchase(
            PulsePassPrincipal principal,
            String requestedEmail) {
        requireAuthenticated(principal);
        if (!hasRole(principal, "USER")
                || principal.getEmail() == null
                || requestedEmail == null
                || !principal.getEmail().equalsIgnoreCase(requestedEmail.trim())) {
            throw new AccessDeniedException(
                    "Tickets can only be purchased for the authenticated user.");
        }
    }

    public boolean hasOperationsRole(PulsePassPrincipal principal) {
        return principal != null && OPERATIONS_ROLES.contains(principal.getRole());
    }

    private void requireOwner(PulsePassPrincipal principal, String ownerEmail) {
        if (!hasRole(principal, "USER")
                || principal.getEmail() == null
                || ownerEmail == null
                || !principal.getEmail().toLowerCase(Locale.ROOT)
                        .equals(ownerEmail.toLowerCase(Locale.ROOT))) {
            throw new AccessDeniedException("You are not allowed to access this ticket.");
        }
    }

    private boolean hasRole(PulsePassPrincipal principal, String role) {
        return principal != null && role.equals(principal.getRole());
    }

    private void requireAuthenticated(PulsePassPrincipal principal) {
        if (principal == null) {
            throw new AccessDeniedException("Authentication is required.");
        }
    }
}
