package com.blogverse.notification.dto.request;

import com.blogverse.notification.entity.Notification;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequest {

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    private Long senderId;
    private String senderUsername;
    private String senderProfileImage;

    @NotNull(message = "Notification type is required")
    private Notification.Type type;

    private Long postId;
    private Long commentId;
    private String message;
}
