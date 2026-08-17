package com.blogverse.post.dto.response;

import com.blogverse.post.entity.Post;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private Long id;
    private Long userId;
    private String username;
    private String userProfileImage;
    private String title;
    private String content;
    private Post.PostType postType;
    private Post.Visibility visibility;
    private Integer readingTimeMinutes;
    private int likeCount;
    private int commentCount;
    private int shareCount;
    private int viewCount;
    private double trendingScore;
    private Set<String> hashtags;
    private Boolean isLiked;
    private Boolean isBookmarked;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
