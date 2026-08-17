package com.blogverse.app.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "bookmarks")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Bookmark {
    @Id private String id;
    private Long userId;
    private Long postId;
    @Builder.Default
    private String collectionName = "default";
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
