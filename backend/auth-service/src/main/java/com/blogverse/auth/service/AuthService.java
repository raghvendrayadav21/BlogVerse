package com.blogverse.auth.service;

import com.blogverse.auth.dto.request.LoginRequest;
import com.blogverse.auth.dto.request.RefreshTokenRequest;
import com.blogverse.auth.dto.request.RegisterRequest;
import com.blogverse.auth.dto.response.AuthResponse;

public interface AuthService {

    /**
     * Register a new user with email/password.
     *
     * @param request registration data
     * @return auth response with JWT tokens
     * @throws com.blogverse.auth.exception.DuplicateResourceException if email or username exists
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticate user with email and password.
     *
     * @param request login credentials
     * @return auth response with JWT tokens
     * @throws org.springframework.security.authentication.BadCredentialsException if credentials invalid
     */
    AuthResponse login(LoginRequest request);

    /**
     * Refresh the access token using a valid refresh token.
     *
     * @param request containing the refresh token
     * @return new auth response with fresh tokens
     */
    AuthResponse refreshToken(RefreshTokenRequest request);

    /**
     * Logout user by revoking their refresh token.
     *
     * @param refreshToken the refresh token to revoke
     */
    void logout(String refreshToken);

    /**
     * Process Google OAuth2 login or registration.
     * Creates a new user if the Google email is not already registered.
     *
     * @param email    Google account email
     * @param name     Display name from Google
     * @param googleId Google's unique subject ID
     * @param picture  Profile picture URL from Google
     * @return auth response with JWT tokens
     */
    /**
     * Change user password.
     */
    void changePassword(Long userId, com.blogverse.auth.dto.request.ChangePasswordRequest request);

    AuthResponse processGoogleOAuth(String email, String name, String customUsername, String googleId, String picture);
}
