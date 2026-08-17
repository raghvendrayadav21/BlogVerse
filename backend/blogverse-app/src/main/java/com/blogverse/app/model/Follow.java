package com.blogverse.app.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "follows")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Follow {
    @Id private String id;
    private Long followerId;
    private Long followingId;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
