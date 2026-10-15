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

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           UserProfileRepository userProfileRepository,
                           UserMapper userMapper,
                           Clock clock) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userMapper = userMapper;
        this.clock = clock;
    }

    public UserServiceImpl(UserRepository userRepository,
                           UserProfileRepository userProfileRepository,
                           UserMapper userMapper) {
        this(userRepository, userProfileRepository, userMapper, Clock.systemDefaultZone());
    }

    @Override
    @Transactional
    public UserResponse register(RegisterUserRequest request) {
        if (request == null) {
            throw new BusinessRuleException("User request is required.");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username already exists: " + request.username());
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Email already exists: " + request.email());
        }
        if (request.birthDate() == null || request.birthDate().isAfter(LocalDate.now(clock))) {
            throw new BusinessRuleException("Birth date cannot be in the future.");
        }

        User user = userRepository.save(new User(request.username(), request.email(), true));
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
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}
