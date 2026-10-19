package com.pulsepass.controller;

import com.pulsepass.dto.response.VenueResponse;
import com.pulsepass.service.VenueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.pulsepass.security.CustomUserDetailsService;
import java.util.List;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.pulsepass.security.JwtService;
@WebMvcTest(VenueController.class)
class VenueControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean VenueService venueService;
    @MockitoBean
    JwtService jwtService;
    @MockitoBean
    CustomUserDetailsService customUserDetailsService;
    @Test void findVenueReturns200AndDto() throws Exception {
        when(venueService.findByCode("VEN-SMR-01")).thenReturn(
                new VenueResponse(1L, "VEN-SMR-01", "Marina Convention Center", "Santa Marta", null, 3, true));
        mvc.perform(get("/api/venues/VEN-SMR-01"))
                .andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.code").value("VEN-SMR-01"));
    }

    @Test void activeVenuesReturns200() throws Exception {
        when(venueService.findActiveVenues()).thenReturn(List.of());
        mvc.perform(get("/api/venues/active")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }
}
