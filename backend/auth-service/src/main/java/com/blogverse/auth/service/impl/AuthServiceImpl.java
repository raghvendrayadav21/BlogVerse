package com.blogverse.auth.service.impl;

import com.blogverse.auth.dto.request.LoginRequest;
import com.blogverse.auth.dto.request.RefreshTokenRequest;
import com.blogverse.auth.dto.request.RegisterRequest;
import com.blogverse.auth.dto.response.AuthResponse;
import com.blogverse.auth.entity.RefreshToken;
import com.blogverse.auth.entity.User;
import com.blogverse.auth.exception.DuplicateResourceException;
import com.blogverse.auth.exception.InvalidTokenException;
import com.blogverse.auth.exception.UserNotFoundException;
import com.blogverse.auth.repository.RefreshTokenRepository;
import com.blogverse.auth.repository.UserRepository;
import com.blogverse.auth.security.JwtTokenProvider;
import com.blogverse.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Core authentication service implementation.
 * Handles registration, login, token refresh, logout, and Google OAuth2.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final org.springframework.web.client.RestTemplate restTemplate;

    // ─── Register ────────────────────────────────────────────────────

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Check for password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Check for duplicates
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }

        // Create and save user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .provider(User.AuthProvider.LOCAL)
                .bio(request.getBio())
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("New user registered | id={} | email={}", user.getId(), user.getEmail());

        syncUserProfileToUserService(user);

        return buildAuthResponse(user);
    }

    // ─── Login ───────────────────────────────────────────────────────

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed - user not found: {}", request.getEmail());
                    return new BadCredentialsException("Invalid email or password");
                });

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is suspended or deleted");
        }

        if (user.isGoogleUser()) {
            throw new BadCredentialsException("This account uses Google login. Please sign in with Google.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed - bad password for: {}", request.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }

        log.info("Login successful | userId={}", user.getId());
        return buildAuthResponse(user);
    }

    // ─── Refresh Token ────────────────────────────────────────────────

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found"));

        if (!refreshToken.isValid()) {
            throw new InvalidTokenException("Refresh token is expired or revoked");
        }

        // Revoke old token (rotation pattern)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        log.info("Token refreshed for userId={}", user.getId());
        return buildAuthResponse(user);
    }

    // ─── Logout ──────────────────────────────────────────────────────

    @Override
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    log.info("User logged out | userId={}", token.getUserId());
                });
    }

    // ─── Google OAuth2 ────────────────────────────────────────────────

    @Override
    public AuthResponse processGoogleOAuth(String email, String name, String customUsername, String googleId, String picture) {
        log.info("Processing Google OAuth2 for email: {}, customUsername: {}", email, customUsername);

        // Find existing user by Google provider ID or email
        User user = userRepository.findByGoogleProviderId(googleId)
                .or(() -> userRepository.findByEmailAndGoogleProvider(email))
                .orElseGet(() -> {
                    log.info("Creating new user from Google OAuth | email={}", email);
                    String username = (customUsername != null && !customUsername.trim().isEmpty())
                            ? sanitizeAndEnsureUniqueUsername(customUsername)
                            : generateUniqueUsername(name, email);
                    return userRepository.save(User.builder()
                            .username(username)
                            .email(email)
                            .provider(User.AuthProvider.GOOGLE)
                            .providerId(googleId)
                            .profileImageUrl(picture) // null as requested
                            .role(User.Role.USER)
                            .status(User.UserStatus.ACTIVE)
                            .build());
                });

        // Update username if custom username provided
        if (customUsername != null && !customUsername.trim().isEmpty() && !user.getUsername().equalsIgnoreCase(customUsername.trim())) {
            String newUsername = sanitizeAndEnsureUniqueUsername(customUsername);
            user.setUsername(newUsername);
            user = userRepository.save(user);
        }

        user.setProfileImageUrl(picture); // null as requested
        user = userRepository.save(user);

        syncUserProfileToUserService(user);

        log.info("Google OAuth successful | userId={}", user.getId());
        return buildAuthResponse(user);
    }

    private String sanitizeAndEnsureUniqueUsername(String rawUsername) {
        String base = rawUsername.toLowerCase().replaceAll("\\s+", "_").replaceAll("[^a-z0-9_]", "");
        if (base.length() < 3) base = "user_" + base;
        if (base.length() > 30) base = base.substring(0, 30);

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }

    // ─── Private helpers ──────────────────────────────────────────────

    /**
     * Builds the full auth response with access + refresh tokens.
     * Revokes any existing refresh tokens for this user first.
     */
    private AuthResponse buildAuthResponse(User user) {
        // Generate new tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshTokenValue = jwtTokenProvider.generateRefreshTokenValue();

        // Store new refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshTokenValue)
                .expiresAt(LocalDateTime.now().plusSeconds(
                        jwtTokenProvider.getRefreshTokenExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .accessTokenExpiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .issuedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Generates a unique username from the Google display name.
     * Falls back to email prefix if name conflicts.
     */
    private String generateUniqueUsername(String displayName, String email) {
        // Clean display name: lowercase, spaces → underscores, remove non-alphanumeric
        String base = displayName != null
                ? displayName.toLowerCase().replaceAll("\\s+", "_").replaceAll("[^a-z0-9_]", "")
                : email.split("@")[0].replaceAll("[^a-z0-9_]", "");

        if (base.length() < 3) base = "user_" + base;
        if (base.length() > 30) base = base.substring(0, 30);

        // Ensure uniqueness
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }

    @Override
    public void changePassword(Long userId, com.blogverse.auth.dto.request.ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user {}", userId);
    }

    private void syncUserProfileToUserService(User user) {
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("id", user.getId());
            payload.put("username", user.getUsername());
            payload.put("email", user.getEmail());
            payload.put("profileImageUrl", user.getProfileImageUrl());
            payload.put("bio", user.getBio());

            // Calls user-service directly via localhost:8088
            String userServiceUrl = "http://localhost:8088/api/internal/users";
            restTemplate.postForObject(userServiceUrl, payload, Object.class);
            log.info("Synced user {} with user-service", user.getId());
        } catch (Exception e) {
            log.warn("Failed to sync user {} to user-service: {}", user.getId(), e.getMessage());
        }
    }
}
