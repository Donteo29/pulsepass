
package com.pulsepass.config;

import com.pulsepass.security.CustomUserDetailsService;
import com.pulsepass.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter,
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(
                userDetailsService
        );
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()

                        // Consultas públicas del catálogo.
                        .requestMatchers(HttpMethod.GET, "/api/events/published").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/events/by-artist").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/events/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/artists/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/venues/**").permitAll()

                        // Las consultas por correo o usuario son privadas.
                        .requestMatchers("/api/users/**").authenticated()

                        // Solo personal autorizado puede administrar eventos.
                        .requestMatchers(HttpMethod.POST, "/api/events/**")
                        .hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/events/**")
                        .hasAnyRole("STAFF", "ADMIN")

                        // Compras requieren autenticación; operaciones de gestión,
                        // como usar o cancelar entradas, se restringen a personal.
                        .requestMatchers(HttpMethod.POST, "/api/tickets")
                        .authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/tickets/**")
                        .hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/tickets/**")
                        .authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
