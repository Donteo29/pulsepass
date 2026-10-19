
package com.pulsepass.security;

import com.pulsepass.entity.User;
import com.pulsepass.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String login) {
        User user = userRepository.findByEmailIgnoreCase(login)
                .or(() -> userRepository.findByUsername(login))
                .orElseThrow(() ->
                        new UsernameNotFoundException("Invalid credentials"));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new UsernameNotFoundException("Invalid credentials");
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole())
                .disabled(!Boolean.TRUE.equals(user.getActive()))
                .build();
    }
}
