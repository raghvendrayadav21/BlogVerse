package com.blogverse.notification.service;

import com.blogverse.notification.dto.response.NotificationResponse;
import com.blogverse.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    Page<NotificationResponse> getNotifications(Long recipientId, Pageable pageable);

    long getUnreadCount(Long recipientId);

    void markAsRead(Long notificationId, Long recipientId);

    void markAllAsRead(Long recipientId);

    NotificationResponse createNotification(Long recipientId, Long senderId, String senderUsername, String senderProfileImage, Notification.Type type, Long postId, Long commentId, String message);
}
