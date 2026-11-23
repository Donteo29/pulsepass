package com.pulsepass.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthorizationServiceTest {
    private final AuthorizationService authorization = new AuthorizationService();
    private final PulsePassPrincipal user =
            new PulsePassPrincipal(10L, "ana", "ana@example.test", "hash", "USER", true);

    @Test
    void userCanOnlyReadTheirOwnUserRecord() {
        authorization.requireUserOrAdmin(user, 10L);
        assertThatThrownBy(() -> authorization.requireUserOrAdmin(user, 11L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void purchaseMustUseAuthenticatedEmail() {
        authorization.requireOwnPurchase(user, "ANA@example.test");
        assertThatThrownBy(() ->
                authorization.requireOwnPurchase(user, "other@example.test"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void onlyOwnerOrAdminCanCancelAndStaffCanReadOperationalTickets() {
        authorization.requireTicketCancellation(user, "ana@example.test");
        assertThatThrownBy(() ->
                authorization.requireTicketCancellation(user, "other@example.test"))
                .isInstanceOf(AccessDeniedException.class);

        PulsePassPrincipal staff =
                new PulsePassPrincipal(12L, "staff", "staff@example.test", "hash", "STAFF", true);
        authorization.requireTicketRead(staff, "ana@example.test");
        assertThat(authorization.canViewUnpublished(staff)).isTrue();
        assertThat(authorization.canViewUnpublished(user)).isFalse();
    }
}
