package com.blogverse.app.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification {
    @Id
    private Long id;
    private Long recipientId;
    private Long senderId;
    private String senderUsername;
    private String senderProfileImage;
    private String type; // LIKE, COMMENT, FOLLOW, SHARE, SYSTEM
    private String message;
    private Long targetPostId;
    @Builder.Default
    private boolean read = false;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
