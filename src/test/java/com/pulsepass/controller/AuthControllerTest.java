package com.pulsepass.controller;

import com.pulsepass.dto.response.AuthResponse;
import com.pulsepass.config.PasswordConfig;
import com.pulsepass.config.SecurityConfig;
import com.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.security.JwtService;
import com.pulsepass.security.JwtAuthenticationFilter;
import com.pulsepass.security.PulsePassPrincipal;
import com.pulsepass.security.SecurityErrorResponseWriter;
import com.pulsepass.service.impl.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, PasswordConfig.class, JwtAuthenticationFilter.class})
class AuthControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean AuthService authService;
    @MockitoBean JwtService jwtService;
    @MockitoBean CustomUserDetailsService customUserDetailsService;
    @MockitoBean SecurityErrorResponseWriter securityErrorResponseWriter;

    @Test
    void loginUsesIdentifierContractAndReturnsExpirationInSeconds() throws Exception {
        when(authService.login(org.mockito.ArgumentMatchers.any()))
                .thenReturn(new AuthResponse("signed-token", "Bearer", 900));

        mvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"identifier\":\"ana\",\"password\":\"LongPassword2026!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("signed-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900));
    }

    @Test
    void meReturnsOnlyTheAuthenticatedIdentityAndRole() throws Exception {
        PulsePassPrincipal principal = new PulsePassPrincipal(
                7L, "ana", "ana@example.test", "never-return-this", "USER", true);
        var auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities());

        mvc.perform(get("/api/auth/me").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifier").value(7))
                .andExpect(jsonPath("$.username").value("ana"))
                .andExpect(jsonPath("$.email").value("ana@example.test"))
                .andExpect(jsonPath("$.roles[0]").value("USER"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }
}
