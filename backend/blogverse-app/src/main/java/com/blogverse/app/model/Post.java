package com.blogverse.app.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "posts")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Post {

    @Id
    private Long id;

    private Long userId;
    private String username;
    private String userProfileImage;
    private String authorBio;

    private String title;

    @Indexed(name = "idx_post_content")
    private String content;

    private String excerpt;
    private String coverImageUrl;

    @Builder.Default
    private String status = "PUBLISHED"; // PUBLISHED, DRAFT

    @Builder.Default
    private List<String> hashtags = new ArrayList<>();

    @Builder.Default
    private Long likesCount = 0L;

    @Builder.Default
    private Long commentsCount = 0L;

    @Builder.Default
    private Long sharesCount = 0L;

    @Builder.Default
    private Long bookmarksCount = 0L;

    @Builder.Default
    private Long viewCount = 0L;

    @Builder.Default
    private Integer readingTimeMinutes = 1;

    @Builder.Default
    private boolean featured = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}
