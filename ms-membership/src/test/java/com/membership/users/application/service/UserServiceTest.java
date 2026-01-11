package com.membership.users.application.service;

import com.membership.users.application.dto.UserRequestDTO;
import com.membership.users.application.dto.UserResponseDTO;
import com.membership.users.application.mapper.UserMapper;
import com.membership.users.domain.entity.User;
import com.membership.users.domain.repository.UserRepository;
import com.membership.users.infrastructure.exception.ResourceAlreadyExistsException;
import com.membership.users.infrastructure.exception.ResourceNotFoundException;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("User Service Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    private final SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, userMapper, meterRegistry, passwordEncoder);
    }

    @Test
    @DisplayName("Should create user successfully and return DTO")
    void createUser_shouldSaveAndReturnDto() {
        // Given
        UserRequestDTO request = UserRequestDTO.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("password123")
                .roles("ROLE_USER")
                .build();

        User entity = User.builder()
                .id(1L)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .active(true)
                .build();

        UserResponseDTO response = UserResponseDTO.builder()
                .id(entity.getId())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .active(entity.getActive())
                .build();

        given(userRepository.existsByEmail(request.getEmail())).willReturn(false);
        given(passwordEncoder.encode(request.getPassword())).willReturn("encoded-password");
        given(userMapper.toEntity(request)).willReturn(entity);
        given(userRepository.save(entity)).willReturn(entity);
        given(userMapper.toDto(entity)).willReturn(response);

        // When
        UserResponseDTO result = userService.createUser(request);

        // Then
        assertNotNull(result);
        assertEquals(response.getId(), result.getId());
        assertEquals(response.getEmail(), result.getEmail());
        assertEquals(response.getFirstName(), result.getFirstName());
        assertEquals(response.getLastName(), result.getLastName());
        verify(userRepository).save(entity);
        verify(userRepository).existsByEmail(request.getEmail());
    }

    @Test
    @DisplayName("Should throw exception when email already exists during creation")
    void createUser_shouldThrowWhenEmailAlreadyExists() {
        // Given
        UserRequestDTO request = UserRequestDTO.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email("existing@example.com")
                .build();

        given(userRepository.existsByEmail(request.getEmail())).willReturn(true);

        // When & Then
        assertThrows(ResourceAlreadyExistsException.class, () -> userService.createUser(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when user not found by ID")
    void getUserById_shouldThrowWhenNotFound() {
        // Given
        Long nonExistentId = 999L;
        given(userRepository.findById(nonExistentId)).willReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(nonExistentId));
        verify(userRepository).findById(nonExistentId);
    }

    @Test
    @DisplayName("Should throw exception when email already exists during update")
    void updateUser_shouldThrowWhenEmailAlreadyExists() {
        // Given
        Long userId = 1L;
        UserRequestDTO request = UserRequestDTO.builder()
                .firstName("Updated")
                .lastName("Name")
                .email("newemail@example.com")
                .build();

        User existingUser = User.builder()
                .id(userId)
                .firstName("Old")
                .lastName("Name")
                .email("old@example.com")
                .active(true)
                .build();

        given(userRepository.findById(userId)).willReturn(Optional.of(existingUser));
        given(userRepository.existsByEmail(request.getEmail())).willReturn(true);

        // When & Then
        assertThrows(ResourceAlreadyExistsException.class, () -> userService.updateUser(userId, request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should deactivate user successfully by setting active to false")
    void deactivateUser_shouldSetActiveToFalse() {
        // Given
        Long userId = 1L;
        User activeUser = User.builder()
                .id(userId)
                .firstName("Active")
                .lastName("User")
                .email("active@example.com")
                .active(true)
                .build();

        User deactivatedUser = User.builder()
                .id(userId)
                .firstName("Active")
                .lastName("User")
                .email("active@example.com")
                .active(false)
                .build();

        UserResponseDTO response = UserResponseDTO.builder()
                .id(deactivatedUser.getId())
                .firstName(deactivatedUser.getFirstName())
                .lastName(deactivatedUser.getLastName())
                .email(deactivatedUser.getEmail())
                .active(false)
                .build();

        given(userRepository.findById(userId)).willReturn(Optional.of(activeUser));
        given(userRepository.save(any(User.class))).willReturn(deactivatedUser);
        given(userMapper.toDto(deactivatedUser)).willReturn(response);

        // When
        UserResponseDTO result = userService.deactivateUser(userId);

        // Then
        assertNotNull(result);
        assertFalse(result.getActive());
        assertEquals(userId, result.getId());
        verify(userRepository).findById(userId);
        verify(userRepository).save(any(User.class));
    }
}
