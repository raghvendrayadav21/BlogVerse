package com.blogverse.post.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
