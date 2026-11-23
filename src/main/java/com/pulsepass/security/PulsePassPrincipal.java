package com.pulsepass.security;

import com.pulsepass.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public final class PulsePassPrincipal implements UserDetails {
    private final Long userId;
    private final String username;
    private final String email;
    private final String passwordHash;
    private final String role;
    private final boolean active;

    public PulsePassPrincipal(User user) {
        this(user.getId(), user.getUsername(), user.getEmail(),
                user.getPasswordHash(), user.getRole(),
                Boolean.TRUE.equals(user.getActive()));
    }

    public PulsePassPrincipal(
            Long userId,
            String username,
            String email,
            String passwordHash,
            String role,
            boolean active) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.active = active;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return username; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return active; }
}
