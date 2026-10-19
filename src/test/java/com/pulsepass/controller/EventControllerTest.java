package com.pulsepass.controller;

import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.service.EventService;
import com.pulsepass.service.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.CustomUserDetailsService;
@WebMvcTest(EventController.class)
class EventControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean EventService eventService;
    @MockitoBean TicketService ticketService;
    @MockitoBean
    JwtService jwtService;
    @MockitoBean
    CustomUserDetailsService customUserDetailsService;
    @Test void invalidCreateRequestReturns400WithoutCallingService() throws Exception {
        mvc.perform(post("/api/events").contentType("application/json")
                .content("{\"eventCode\":\"\",\"name\":\"\",\"category\":null,\"eventDate\":null,\"minimumAge\":-1,\"venueCode\":\"\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details").isMap());
        verify(eventService, never()).create(any());
    }

    @Test void unknownEventMapsServiceNotFoundTo404() throws Exception {
        when(eventService.findByCode("MISSING")).thenThrow(
                new com.pulsepass.exception.ResourceNotFoundException("Event not found: MISSING"));
        mvc.perform(get("/api/events/MISSING")).andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Event not found: MISSING"));
    }
}
