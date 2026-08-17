package com.blogverse.post.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_posts_user_id", columnList = "user_id"),
        @Index(name = "idx_posts_trending_score", columnList = "trending_score"),
        @Index(name = "idx_posts_created_at", columnList = "created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "user_profile_image", length = 1024)
    private String userProfileImage;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false, length = 20)
    @Builder.Default
    private PostType postType = PostType.TEXT;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    @Column(name = "reading_time_minutes")
    @Builder.Default
    private Integer readingTimeMinutes = 1;

    @Column(name = "like_count", nullable = false)
    @Builder.Default
    private int likeCount = 0;

    @Column(name = "comment_count", nullable = false)
    @Builder.Default
    private int commentCount = 0;

    @Column(name = "share_count", nullable = false)
    @Builder.Default
    private int shareCount = 0;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private int viewCount = 0;

    @Column(name = "trending_score", nullable = false)
    @Builder.Default
    private double trendingScore = 0.0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_hashtags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "hashtag")
    @Builder.Default
    private Set<String> hashtags = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PostType {
        TEXT, IMAGE, VIDEO, MIXED
    }

    public enum Visibility {
        PUBLIC, FOLLOWERS_ONLY, PRIVATE
    }

    /**
     * Recalculates the trending score based on likes, comments, shares, views, and recency.
     */
    public void updateTrendingScore() {
        long hours = java.time.Duration.between(createdAt != null ? createdAt : LocalDateTime.now(), LocalDateTime.now()).toHours();
        double recencyFactor = 1.0 / (1.0 + (hours * 0.1));
        this.trendingScore = ((likeCount * 2.0) + (commentCount * 3.0) + (shareCount * 4.0) + viewCount) * recencyFactor;
    }
}
