package com.blogverse.app.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class User {

    @Id
    private Long id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    @Builder.Default
    private String provider = "LOCAL"; // LOCAL, GOOGLE

    private String providerId;

    @Builder.Default
    private String role = "USER"; // USER, ADMIN

    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, DELETED

    private String bio;
    private String website;
    private String profileImageUrl;

    @Builder.Default
    private Long followersCount = 0L;

    @Builder.Default
    private Long followingCount = 0L;

    @Builder.Default
    private Long postsCount = 0L;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }

    public boolean isGoogleUser() {
        return "GOOGLE".equals(provider);
    }

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}
