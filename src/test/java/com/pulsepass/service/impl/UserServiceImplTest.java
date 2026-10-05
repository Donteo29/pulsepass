package com.pulsepass.service.impl;

import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.entity.User;
import com.pulsepass.entity.UserProfile;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.mapper.UserMapper;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserMapper userMapper;

    private UserServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new UserServiceImpl(
                userRepository,
                userProfileRepository,
                userMapper,
                Clock.fixed(Instant.parse("2026-01-01T12:00:00Z"), ZoneOffset.UTC)
        );
    }

    @Test
    void registerCreatesActiveUserAndProfile() {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "andrea@example.com", "Andrea", "Perez",
                "3001234567", "Santa Marta", LocalDate.of(1994, 2, 3)
        );
        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        UserResponse response = new UserResponse(null, "andrea", "andrea@example.com", true,
                "Andrea", "Perez", "3001234567", "Santa Marta", request.birthDate());
        when(userMapper.toResponse(any(User.class))).thenReturn(response);

        assertThat(service.register(request)).isSameAs(response);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getActive()).isTrue();
        ArgumentCaptor<UserProfile> profileCaptor = ArgumentCaptor.forClass(UserProfile.class);
        verify(userProfileRepository).save(profileCaptor.capture());
        assertThat(profileCaptor.getValue().getUser()).isSameAs(userCaptor.getValue());
    }

    @Test
    void duplicateUsernameFailsBeforeSaving() {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "andrea@example.com", "Andrea", "Perez", null, null,
                LocalDate.of(1994, 2, 3)
        );
        when(userRepository.existsByUsername("andrea")).thenReturn(true);

        assertThatThrownBy(() -> service.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Username already exists: andrea");
        verify(userRepository, never()).save(any());
        verify(userProfileRepository, never()).save(any());
    }

    @Test
    void duplicateEmailFailsBeforeSaving() {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "andrea@example.com", "Andrea", "Perez", null, null,
                LocalDate.of(1994, 2, 3)
        );
        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@example.com")).thenReturn(true);

        assertThatThrownBy(() -> service.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Email already exists: andrea@example.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    void futureBirthDateFailsBeforeSaving() {
        RegisterUserRequest request = new RegisterUserRequest(
                "andrea", "andrea@example.com", "Andrea", "Perez", null, null,
                LocalDate.of(2027, 1, 1)
        );
        when(userRepository.existsByUsername("andrea")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("andrea@example.com")).thenReturn(false);

        assertThatThrownBy(() -> service.register(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Birth date cannot be in the future.");
        verify(userRepository, never()).save(any());
    }

    @Test
    void findByEmailUsesMappedUser() {
        User user = new User("andrea", "andrea@example.com", true);
        UserResponse response = new UserResponse(null, "andrea", "andrea@example.com", true,
                null, null, null, null, null);
        when(userRepository.findByEmailIgnoreCase("ANDREA@EXAMPLE.COM")).thenReturn(Optional.of(user));
        when(userMapper.toResponse(user)).thenReturn(response);

        assertThat(service.findByEmail("ANDREA@EXAMPLE.COM")).isSameAs(response);
    }
}
