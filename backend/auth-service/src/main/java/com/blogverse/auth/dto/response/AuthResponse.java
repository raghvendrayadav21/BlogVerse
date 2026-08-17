package com.blogverse.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Auth response returned on successful login or register.
 * Never exposes password or internal IDs unnecessarily.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private Long userId;
    private String username;
    private String email;
    private String role;
    private String profileImageUrl;
    private String bio;

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long accessTokenExpiresIn;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime issuedAt;
}
