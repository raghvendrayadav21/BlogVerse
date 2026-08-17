package com.blogverse.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Core user entity stored in the auth-service schema.
 *
 * <p>For Google OAuth2 users: password is null, provider = 'GOOGLE', providerId = Google's sub.
 * <p>For regular users: password is BCrypt-hashed, provider = 'LOCAL', providerId is null.
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_username", columnList = "username", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 20)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(name = "profile_image_url", length = 1024)
    private String profileImageUrl;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "website", length = 255)
    private String website;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "followers_count", nullable = false, columnDefinition = "int default 0")
    @Builder.Default
    private int followersCount = 0;

    @Column(name = "following_count", nullable = false, columnDefinition = "int default 0")
    @Builder.Default
    private int followingCount = 0;

    @Column(name = "posts_count", nullable = false, columnDefinition = "int default 0")
    @Builder.Default
    private int postsCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ─── Enums ──────────────────────────────────────────────────────

    public enum AuthProvider {
        LOCAL, GOOGLE
    }

    public enum Role {
        USER, ADMIN
    }

    public enum UserStatus {
        ACTIVE, SUSPENDED, DELETED
    }

    // ─── Utility methods ────────────────────────────────────────────

    public boolean isGoogleUser() {
        return AuthProvider.GOOGLE.equals(this.provider);
    }

    public boolean isAdmin() {
        return Role.ADMIN.equals(this.role);
    }

    public boolean isActive() {
        return UserStatus.ACTIVE.equals(this.status);
    }
}
