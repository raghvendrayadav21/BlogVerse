package com.blogverse.app.controller;

import com.blogverse.app.exception.ApiResponse;
import com.blogverse.app.model.Notification;
import com.blogverse.app.security.UserPrincipal;
import com.blogverse.app.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched",
                notificationService.getNotifications(principal.getUserId(), page, size)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Count fetched",
                notificationService.getUnreadCount(principal.getUserId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAsRead(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Notification>> createNotification(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long recipientId = Long.parseLong(body.get("recipientId").toString());
        String type = (String) body.get("type");
        String message = (String) body.get("message");
        Long postId = body.get("postId") != null ? Long.parseLong(body.get("postId").toString()) : null;

        Notification n = notificationService.createNotification(
                recipientId, principal.getUserId(), principal.getUsername(),
                null, type, message, postId);
        return ResponseEntity.status(201).body(ApiResponse.created("Notification created", n));
    }
}
