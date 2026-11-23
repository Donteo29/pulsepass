package com.pulsepass.controller;

import com.pulsepass.config.PasswordConfig;
import com.pulsepass.config.SecurityConfig;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.entity.EventCategory;
import com.pulsepass.entity.EventStatus;
import com.pulsepass.entity.TicketStatus;
import com.pulsepass.entity.TicketType;
import com.pulsepass.exception.GlobalExceptionHandler;
import com.pulsepass.security.AuthorizationService;
import com.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.security.JwtAuthenticationFilter;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.PulsePassPrincipal;
import com.pulsepass.security.SecurityErrorResponseWriter;
import com.pulsepass.service.ArtistService;
import com.pulsepass.service.EventService;
import com.pulsepass.service.TicketService;
import com.pulsepass.service.UserService;
import com.pulsepass.service.VenueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        EventController.class, TicketController.class, UserController.class
})
@Import({
        SecurityConfig.class, PasswordConfig.class, JwtAuthenticationFilter.class,
        SecurityErrorResponseWriter.class, AuthorizationService.class,
        GlobalExceptionHandler.class
})
class SecurityRulesMvcTest {
    @Autowired MockMvc mvc;
    @MockitoBean EventService eventService;
    @MockitoBean TicketService ticketService;
    @MockitoBean UserService userService;
    @MockitoBean ArtistService artistService;
    @MockitoBean VenueService venueService;
    @MockitoBean JwtService jwtService;
    @MockitoBean CustomUserDetailsService customUserDetailsService;

    @Test
    void onlyAdminCanCreateEvents() throws Exception {
        when(eventService.create(any())).thenReturn(event(EventStatus.DRAFT));
        String body = """
                {"eventCode":"EVT-SEC-1","name":"Demo event","description":"Demo",
                 "category":"MUSIC","eventDate":"2030-01-01T20:00:00",
                 "minimumAge":0,"venueCode":"VEN-SMR-01"}
                """;

        mvc.perform(post("/api/events").contentType("application/json").content(body))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/events").with(user("ana").roles("USER"))
                        .contentType("application/json").content(body))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/events").with(principal("admin", "admin@example.test", 1L, "ADMIN"))
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void publicEventLookupNeverRevealsDrafts() throws Exception {
        when(eventService.findByCode("DRAFT-1")).thenReturn(event(EventStatus.DRAFT));

        mvc.perform(get("/api/events/DRAFT-1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        mvc.perform(get("/api/events/DRAFT-1")
                        .with(principal("ana", "ana@example.test", 7L, "USER")))
                .andExpect(status().isNotFound());

        mvc.perform(get("/api/events/DRAFT-1")
                        .with(principal("staff", "staff@example.test", 8L, "STAFF")))
                .andExpect(status().isOk());
    }

    @Test
    void userCannotQueryAnotherUsersTicketOrPurchaseForThem() throws Exception {
        when(ticketService.findByCode("TCK-OTHER")).thenReturn(ticket("other@example.test"));
        mvc.perform(get("/api/tickets/TCK-OTHER")
                        .with(principal("ana", "ana@example.test", 7L, "USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mvc.perform(post("/api/tickets")
                        .with(principal("ana", "ana@example.test", 7L, "USER"))
                        .contentType("application/json")
                        .content("{\"userEmail\":\"other@example.test\",\"eventCode\":\"EVT-1\",\"type\":\"GENERAL\"}"))
                .andExpect(status().isForbidden());
        verify(ticketService, never()).purchase(any());
    }

    @Test
    void onlyStaffOrAdminCanSeePaidEventTickets() throws Exception {
        when(ticketService.findPaidTicketsByEvent("EVT-1")).thenReturn(List.of());
        mvc.perform(get("/api/events/EVT-1/tickets/paid")
                        .with(principal("ana", "ana@example.test", 7L, "USER")))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/events/EVT-1/tickets/paid")
                        .with(principal("staff", "staff@example.test", 8L, "STAFF")))
                .andExpect(status().isOk());
    }

    @Test
    void userCannotReadAnotherUsersProfile() throws Exception {
        when(userService.findByEmail("other@example.test")).thenReturn(
                new UserResponse(11L, "other", "other@example.test", true,
                        "Other", "Person", null, null, null));
        mvc.perform(get("/api/users/by-email").param("email", "other@example.test")
                        .with(principal("ana", "ana@example.test", 7L, "USER")))
                .andExpect(status().isForbidden());
    }

    private RequestPostProcessor principal(
            String username, String email, Long id, String role) {
        PulsePassPrincipal principal = new PulsePassPrincipal(
                id, username, email, "hash", role, true);
        return authentication(new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()));
    }

    private EventResponse event(EventStatus status) {
        return new EventResponse(1L, "DRAFT-1", "Draft event", "private",
                EventCategory.MUSIC, status, LocalDateTime.of(2030, 1, 1, 20, 0),
                0, "VEN-SMR-01", "Venue", List.of());
    }

    private TicketResponse ticket(String email) {
        return new TicketResponse(1L, "TCK-OTHER", TicketType.GENERAL,
                BigDecimal.valueOf(100), TicketStatus.PAID,
                LocalDateTime.of(2026, 11, 1, 10, 0), email,
                "EVT-1", "Event");
    }
}
