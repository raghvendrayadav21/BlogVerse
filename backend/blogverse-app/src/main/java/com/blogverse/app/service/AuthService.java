package com.blogverse.app.service;

import com.blogverse.app.dto.request.LoginRequest;
import com.blogverse.app.dto.request.RegisterRequest;
import com.blogverse.app.dto.response.AuthResponse;
import com.blogverse.app.model.RefreshToken;
import com.blogverse.app.model.User;
import com.blogverse.app.repository.RefreshTokenRepository;
import com.blogverse.app.repository.UserRepository;
import com.blogverse.app.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final SequenceGeneratorService sequenceGenerator;

    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }

        User user = User.builder()
                .id(sequenceGenerator.generateSequence(SequenceGeneratorService.USER_SEQ))
                .username(request.getUsername().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .provider("LOCAL")
                .role("USER")
                .status("ACTIVE")
                .bio(request.getBio())
                .build();

        user = userRepository.save(user);
        log.info("Registered new user | id={} | email={}", user.getId(), user.getEmail());
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is suspended");
        }
        if (user.isGoogleUser()) {
            throw new BadCredentialsException("This account uses Google login");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        log.info("Login successful | userId={}", user.getId());
        return buildAuthResponse(user);
    }

    public AuthResponse refreshToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            throw new IllegalArgumentException("Refresh token expired or revoked");
        }

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildAuthResponse(user);
    }

    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    public AuthResponse processGoogleOAuth(String email, String name, String customUsername, String googleId, String picture) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseGet(() -> {
                    String username = (customUsername != null && !customUsername.isBlank())
                            ? ensureUniqueUsername(customUsername)
                            : generateUsername(name, email);
                    User newUser = User.builder()
                            .id(sequenceGenerator.generateSequence(SequenceGeneratorService.USER_SEQ))
                            .username(username)
                            .email(email.toLowerCase())
                            .provider("GOOGLE")
                            .providerId(googleId)
                            .role("USER")
                            .status("ACTIVE")
                            .build();
                    return userRepository.save(newUser);
                });

        if (customUsername != null && !customUsername.isBlank()
                && !user.getUsername().equalsIgnoreCase(customUsername.trim())) {
            user.setUsername(ensureUniqueUsername(customUsername));
            user = userRepository.save(user);
        }

        log.info("Google OAuth success | userId={}", user.getId());
        return buildAuthResponse(user);
    }

    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshTokenValue = jwtTokenProvider.generateRefreshTokenValue();

        RefreshToken refreshToken = RefreshToken.builder()
                .id(UUID.randomUUID().toString())
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
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .accessTokenExpiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .issuedAt(LocalDateTime.now())
                .build();
    }

    private String ensureUniqueUsername(String raw) {
        String base = raw.toLowerCase().replaceAll("\\s+", "_").replaceAll("[^a-z0-9_]", "");
        if (base.length() < 3) base = "user_" + base;
        if (base.length() > 30) base = base.substring(0, 30);
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }

    private String generateUsername(String displayName, String email) {
        String base = displayName != null
                ? displayName.toLowerCase().replaceAll("\\s+", "_").replaceAll("[^a-z0-9_]", "")
                : email.split("@")[0].replaceAll("[^a-z0-9_]", "");
        if (base.length() < 3) base = "user_" + base;
        if (base.length() > 30) base = base.substring(0, 30);
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }
}
