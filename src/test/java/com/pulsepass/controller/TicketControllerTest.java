package com.pulsepass.controller;

import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.entity.TicketStatus;
import com.pulsepass.entity.TicketType;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.service.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.CustomUserDetailsService;
@WebMvcTest(TicketController.class)
class TicketControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean TicketService ticketService;
    @MockitoBean
    JwtService jwtService;
    @MockitoBean
    CustomUserDetailsService customUserDetailsService;
    @Test void invalidPurchaseReturns400WithoutCallingService() throws Exception {
        mvc.perform(post("/api/tickets").contentType("application/json")
                .content("{\"userEmail\":\"mal\",\"eventCode\":\"\",\"type\":null}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
        verify(ticketService, never()).purchase(any());
    }

    @Test void businessRuleMapsTo409() throws Exception {
        when(ticketService.findByCode("TCK-1")).thenThrow(new BusinessRuleException("Ticket cannot be processed"));
        mvc.perform(get("/api/tickets/TCK-1")).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Ticket cannot be processed"));
    }
}
