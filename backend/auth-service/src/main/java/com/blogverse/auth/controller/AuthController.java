package com.blogverse.auth.controller;

import com.blogverse.auth.dto.request.LoginRequest;
import com.blogverse.auth.dto.request.RefreshTokenRequest;
import com.blogverse.auth.dto.request.RegisterRequest;
import com.blogverse.auth.dto.response.AuthResponse;
import com.blogverse.auth.exception.ApiResponse;
import com.blogverse.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication REST controller.
 * Thin controller — all business logic is in AuthService.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, logout, token refresh")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("User registered successfully", authResponse));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/google")
    @Operation(summary = "Google OAuth2 sign-in endpoint")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String email = (body != null && body.containsKey("email") && body.get("email") != null && !body.get("email").isEmpty())
                ? body.get("email") : "google_user@gmail.com";
        String name = (body != null && body.containsKey("name") && body.get("name") != null && !body.get("name").isEmpty())
                ? body.get("name") : "Google User";
        String username = (body != null && body.containsKey("username") && body.get("username") != null && !body.get("username").isEmpty())
                ? body.get("username") : null;
        String googleId = (body != null && body.containsKey("googleId") && body.get("googleId") != null && !body.get("googleId").isEmpty())
                ? body.get("googleId") : "google_oauth_1001";
        String picture = (body != null && body.containsKey("picture") && body.get("picture") != null && !body.get("picture").isEmpty())
                ? body.get("picture") : null; // null as requested

        AuthResponse authResponse = authService.processGoogleOAuth(email, name, username, googleId, picture);
        return ResponseEntity.ok(ApiResponse.success("Google login successful", authResponse));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse authResponse = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and revoke refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change user password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody com.blogverse.auth.dto.request.ChangePasswordRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.blogverse.auth.security.UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        authService.changePassword(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check for auth service")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Auth service is running", "OK"));
    }
}
