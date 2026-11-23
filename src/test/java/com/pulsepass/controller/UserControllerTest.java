package com.pulsepass.controller;

import com.pulsepass.config.PasswordConfig;
import com.pulsepass.config.SecurityConfig;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.security.AuthorizationService;
import com.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.security.JwtAuthenticationFilter;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.PulsePassPrincipal;
import com.pulsepass.security.SecurityErrorResponseWriter;
import com.pulsepass.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDate;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, PasswordConfig.class, JwtAuthenticationFilter.class, SecurityErrorResponseWriter.class})
class UserControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean UserService userService;
    @MockitoBean AuthorizationService authorizationService;
    @MockitoBean JwtService jwtService;
    @MockitoBean CustomUserDetailsService customUserDetailsService;

    @Test
    void findUserByEmailReturns200() throws Exception {
        when(userService.findByEmail("andrea@example.com")).thenReturn(
                new UserResponse(1L, "andrea", "andrea@example.com", true,
                        "Andrea", "Perez", null, null, LocalDate.of(1994, 2, 3)));
        mvc.perform(get("/api/users/by-email")
                        .param("email", "andrea@example.com")
                        .with(principal("andrea", "andrea@example.com", 1L, "USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("andrea"));
    }

    @Test
    void invalidEmailReturns400AndDoesNotCallService() throws Exception {
        mvc.perform(get("/api/users/by-email")
                        .param("email", "not-an-email")
                        .with(principal("ana", "ana@example.test", 7L, "USER")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        verifyNoInteractions(userService);
    }

    private RequestPostProcessor principal(String username, String email, Long id, String role) {
        PulsePassPrincipal principal = new PulsePassPrincipal(id, username, email, "hash", role, true);
        return authentication(new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()));
    }
}
