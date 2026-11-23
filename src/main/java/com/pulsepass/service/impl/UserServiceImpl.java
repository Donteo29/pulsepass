
package com.pulsepass.service.impl;

import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.entity.User;
import com.pulsepass.entity.UserProfile;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.UserMapper;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserMapper userMapper;
    private final Clock clock;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            UserMapper userMapper,
            Clock clock,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userMapper = userMapper;
        this.clock = clock;
        this.passwordEncoder = passwordEncoder;
    }

    // Constructor para mantener compatibilidad con pruebas existentes.
    public UserServiceImpl(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            UserMapper userMapper,
            Clock clock) {

        this(
                userRepository,
                userProfileRepository,
                userMapper,
                clock,
                new BCryptPasswordEncoder()
        );
    }

    // Constructor de compatibilidad.
    public UserServiceImpl(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            UserMapper userMapper) {

        this(
                userRepository,
                userProfileRepository,
                userMapper,
                Clock.systemDefaultZone(),
                new BCryptPasswordEncoder()
        );
    }

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {

        if (request == null) {
            throw new BusinessRuleException(
                    "User request is required."
            );
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException(
                    "Username already exists: " + request.username()
            );
        }

        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException(
                    "Email already exists: " + request.email()
            );
        }

        if (request.birthDate() == null
                || request.birthDate().isAfter(LocalDate.now(clock))) {

            throw new BusinessRuleException(
                    "Birth date cannot be in the future."
            );
        }

        // Nunca guardar la contraseña original en la base de datos.
        String passwordHash = passwordEncoder.encode(request.password());

        User user = userRepository.save(
                new User(
                        request.username(),
                        request.email(),
                        passwordHash,
                        "USER",
                        true
                )
        );

        UserProfile profile = new UserProfile(
                request.firstName(),
                request.lastName(),
                request.phone(),
                request.city(),
                request.birthDate(),
                user
        );

        userProfileRepository.save(profile);

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {

        return userRepository.findByEmailIgnoreCase(email)
                .map(userMapper::toResponse)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + email
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByUsername(String username) {

        return userRepository.findByUsername(username)
                .map(userMapper::toResponse)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + username
                        )
                );
    }
}
