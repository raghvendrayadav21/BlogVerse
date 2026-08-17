package com.blogverse.app.controller;

import com.blogverse.app.dto.request.LoginRequest;
import com.blogverse.app.dto.request.RegisterRequest;
import com.blogverse.app.dto.response.AuthResponse;
import com.blogverse.app.exception.ApiResponse;
import com.blogverse.app.security.UserPrincipal;
import com.blogverse.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse resp = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("User registered successfully", resp));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse resp = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", resp));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody Map<String, String> body) {
        AuthResponse resp = authService.refreshToken(body.get("refreshToken"));
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", resp));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody Map<String, String> body) {
        authService.logout(body.get("refreshToken"));
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @RequestBody(required = false) Map<String, String> body) {
        String email = get(body, "email", "google_user@gmail.com");
        String name = get(body, "name", "Google User");
        String username = get(body, "username", null);
        String googleId = get(body, "googleId", "google_oauth_" + System.currentTimeMillis());
        String picture = get(body, "picture", null);

        AuthResponse resp = authService.processGoogleOAuth(email, name, username, googleId, picture);
        return ResponseEntity.ok(ApiResponse.success("Google login successful", resp));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        authService.changePassword(principal.getUserId(), body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Auth service is running", "OK"));
    }

    private String get(Map<String, String> map, String key, String defaultVal) {
        if (map == null) return defaultVal;
        String val = map.get(key);
        return (val != null && !val.isBlank()) ? val : defaultVal;
    }
}
