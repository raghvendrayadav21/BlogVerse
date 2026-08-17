package com.blogverse.auth.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the authenticated user principal populated from gateway-injected headers.
 * Used by all downstream microservices to identify the current user
 * without needing to re-validate the JWT.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal {

    private Long userId;
    private String email;
    private String username;
    private String role;

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }
}
