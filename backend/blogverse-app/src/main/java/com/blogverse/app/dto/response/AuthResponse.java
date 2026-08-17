package com.blogverse.app.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
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
    private LocalDateTime issuedAt;
}
