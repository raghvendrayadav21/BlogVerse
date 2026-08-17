package com.blogverse.app.service;

import com.blogverse.app.model.Notification;
import com.blogverse.app.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SequenceGeneratorService sequenceGenerator;

    public Page<Notification> getNotifications(Long userId, int page, int size) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getRecipientId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public void markAllAsRead(Long userId) {
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 200));
        notifications.forEach(n -> {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public Notification createNotification(Long recipientId, Long senderId, String senderUsername,
                                            String senderProfileImage, String type, String message,
                                            Long postId) {
        Notification notification = Notification.builder()
                .id(sequenceGenerator.generateSequence(SequenceGeneratorService.NOTIFICATION_SEQ))
                .recipientId(recipientId)
                .senderId(senderId)
                .senderUsername(senderUsername)
                .senderProfileImage(senderProfileImage)
                .type(type)
                .message(message)
                .targetPostId(postId)
                .build();
        return notificationRepository.save(notification);
    }
}
