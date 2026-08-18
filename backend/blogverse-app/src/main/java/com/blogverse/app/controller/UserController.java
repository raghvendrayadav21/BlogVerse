package com.blogverse.app.controller;

import com.blogverse.app.exception.ApiResponse;
import com.blogverse.app.model.User;
import com.blogverse.app.security.UserPrincipal;
import com.blogverse.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUser(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", user));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<User>> getProfile(@PathVariable("userId") Long userId) {
        User user = userService.getUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", user));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @PathVariable("userId") Long userId,
            @RequestBody Map<String, Object> updates,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (!principal.getUserId().equals(userId)) {
            return ResponseEntity.status(403).body(ApiResponse.error(403, "Forbidden"));
        }
        User user = userService.updateProfile(userId, updates);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", user));
    }

    @PutMapping("/me/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        String url = userService.updateAvatar(principal.getUserId(), file);
        return ResponseEntity.ok(ApiResponse.success("Avatar updated", Map.of("profileImageUrl", url)));
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<ApiResponse<Void>> follow(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        userService.followUser(principal.getUserId(), userId);
        return ResponseEntity.ok(ApiResponse.success("Followed", null));
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<ApiResponse<Void>> unfollow(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        userService.unfollowUser(principal.getUserId(), userId);
        return ResponseEntity.ok(ApiResponse.success("Unfollowed", null));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<ApiResponse<Page<User>>> getFollowers(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<User> followers = userService.getFollowers(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Followers fetched", followers));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<ApiResponse<Page<User>>> getFollowing(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Page<User> following = userService.getFollowing(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Following fetched", following));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<User>>> getSuggestions(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<User> suggestions = userService.getSuggestedUsers(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Suggestions fetched", suggestions));
    }

    @GetMapping("/admin/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminMetrics() {
        return ResponseEntity.ok(ApiResponse.success("Metrics fetched", userService.getAdminMetrics()));
    }
}
