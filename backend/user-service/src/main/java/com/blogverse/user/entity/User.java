package com.blogverse.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_username", columnList = "username", unique = true),
        @Index(name = "idx_users_email", columnList = "email", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private Long id; // Same ID as in auth-service for cross-service consistency

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "profile_image_url", length = 1024)
    private String profileImageUrl;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "website", length = 255)
    private String website;

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
}
