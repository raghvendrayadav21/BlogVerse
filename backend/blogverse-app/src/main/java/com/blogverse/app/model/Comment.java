package com.blogverse.app.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "comments")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Comment {
    @Id
    private Long id;
    private Long postId;
    private Long authorId;
    private String authorUsername;
    private String authorProfileImageUrl;
    private String content;
    private Long parentCommentId;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
