package com.blogverse.auth.service;

import com.blogverse.auth.dto.request.LoginRequest;
import com.blogverse.auth.dto.request.RegisterRequest;
import com.blogverse.auth.dto.response.AuthResponse;
import com.blogverse.auth.entity.RefreshToken;
import com.blogverse.auth.entity.User;
import com.blogverse.auth.exception.DuplicateResourceException;
import com.blogverse.auth.repository.RefreshTokenRepository;
import com.blogverse.auth.repository.UserRepository;
import com.blogverse.auth.security.JwtTokenProvider;
import com.blogverse.auth.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("encodedPassword")
                .provider(User.AuthProvider.LOCAL)
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("Password123");
        registerRequest.setConfirmPassword("Password123");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("Password123");
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void register_Success() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any())).thenReturn(testUser);
        when(jwtTokenProvider.generateAccessToken(any())).thenReturn("access.token.jwt");
        when(jwtTokenProvider.generateRefreshTokenValue()).thenReturn("refresh-token-uuid");
        when(jwtTokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(jwtTokenProvider.getRefreshTokenExpirationMs()).thenReturn(604800000L);

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("access.token.jwt", response.getAccessToken());
        verify(userRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should throw exception when registering with existing email")
    void register_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should successfully authenticate valid credentials")
    void login_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Password123", "encodedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any())).thenReturn("access.token.jwt");
        when(jwtTokenProvider.generateRefreshTokenValue()).thenReturn("refresh-token-uuid");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("access.token.jwt", response.getAccessToken());
    }

    @Test
    @DisplayName("Should throw exception when login password is invalid")
    void login_BadPassword_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("WrongPassword", "encodedPassword")).thenReturn(false);

        loginRequest.setPassword("WrongPassword");
        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }
}
