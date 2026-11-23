
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

        return new PulsePassPrincipal(user);
    }

    @Transactional(readOnly = true)
    public PulsePassPrincipal loadUserById(String identifier) {
        try {
            long id = Long.parseLong(identifier);
            User user = userRepository.findById(id)
                    .orElseThrow(() ->
                            new UsernameNotFoundException("Invalid token subject"));
            if (!Boolean.TRUE.equals(user.getActive())
                    || user.getPasswordHash() == null
                    || user.getPasswordHash().isBlank()) {
                throw new UsernameNotFoundException("Invalid token subject");
            }
            return new PulsePassPrincipal(user);
        } catch (NumberFormatException ex) {
            throw new UsernameNotFoundException("Invalid token subject", ex);
        }
    }
}
