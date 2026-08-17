package com.blogverse.notification.service.impl;

import com.blogverse.notification.dto.response.NotificationResponse;
import com.blogverse.notification.entity.Notification;
import com.blogverse.notification.repository.NotificationRepository;
import com.blogverse.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(Long recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    @Override
    public void markAsRead(Long notificationId, Long recipientId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getRecipientId().equals(recipientId)) {
            throw new IllegalArgumentException("Unauthorized action");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long recipientId) {
        notificationRepository.markAllReadByRecipientId(recipientId);
    }

    @Override
    public NotificationResponse createNotification(Long recipientId, Long senderId, String senderUsername, String senderProfileImage, Notification.Type type, Long postId, Long commentId, String message) {
        // Prevent sending notification to self
        if (senderId != null && senderId.equals(recipientId)) {
            return null;
        }

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .senderId(senderId)
                .senderUsername(senderUsername != null ? senderUsername : "system")
                .senderProfileImage(senderProfileImage)
                .type(type)
                .postId(postId)
                .commentId(commentId)
                .message(message)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Created notification for recipientId={}", recipientId);
        return mapToResponse(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .recipientId(n.getRecipientId())
                .senderId(n.getSenderId())
                .senderUsername(n.getSenderUsername())
                .senderProfileImage(n.getSenderProfileImage())
                .type(n.getType())
                .postId(n.getPostId())
                .commentId(n.getCommentId())
                .message(n.getMessage())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
