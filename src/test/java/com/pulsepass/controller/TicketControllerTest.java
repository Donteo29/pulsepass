package com.pulsepass.controller;

import com.pulsepass.config.PasswordConfig;
import com.pulsepass.config.SecurityConfig;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.entity.TicketStatus;
import com.pulsepass.entity.TicketType;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.security.AuthorizationService;
import com.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.security.JwtAuthenticationFilter;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.PulsePassPrincipal;
import com.pulsepass.security.SecurityErrorResponseWriter;
import com.pulsepass.service.TicketService;
import com.pulsepass.service.UserService;
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

import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TicketController.class)
@Import({SecurityConfig.class, PasswordConfig.class, JwtAuthenticationFilter.class, SecurityErrorResponseWriter.class})
class TicketControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean TicketService ticketService;
    @MockitoBean UserService userService;
    @MockitoBean AuthorizationService authorizationService;
    @MockitoBean JwtService jwtService;
    @MockitoBean CustomUserDetailsService customUserDetailsService;

    @Test
    void invalidPurchaseReturns400WithoutCallingService() throws Exception {
        mvc.perform(post("/api/tickets")
                        .with(principal("ana", "ana@example.test", 7L, "USER"))
                        .contentType("application/json")
                        .content("{\"userEmail\":\"mal\",\"eventCode\":\"\",\"type\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        verify(ticketService, never()).purchase(any());
    }

    @Test
    void businessRuleMapsTo409() throws Exception {
        when(ticketService.findByCode("TCK-1"))
                .thenThrow(new BusinessRuleException("Ticket cannot be processed"));
        mvc.perform(get("/api/tickets/TCK-1")
                        .with(principal("ana", "ana@example.test", 7L, "USER")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Ticket cannot be processed"));
    }

    private RequestPostProcessor principal(String username, String email, Long id, String role) {
        PulsePassPrincipal principal = new PulsePassPrincipal(id, username, email, "hash", role, true);
        return authentication(new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()));
    }
}
