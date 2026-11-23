package com.pulsepass.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final SecurityErrorResponseWriter errorResponseWriter;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            SecurityErrorResponseWriter errorResponseWriter) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.errorResponseWriter = errorResponseWriter;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String subject = jwtService.extractSubject(header.substring(7));
            PulsePassPrincipal principal =
                    userDetailsService.loadUserById(subject);
            if (!jwtService.isTokenValid(header.substring(7), principal)) {
                throw new JwtException("Invalid token");
            }
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                var authentication = new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities());
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
            filterChain.doFilter(request, response);
        } catch (JwtException | IllegalArgumentException
                 | UsernameNotFoundException ex) {
            SecurityContextHolder.clearContext();
            errorResponseWriter.write(
                    response,
                    HttpStatus.UNAUTHORIZED,
                    "Invalid or expired token"
            );
        }
    }
}
