package com.blogverse.user.controller;

import com.blogverse.user.dto.request.UpdateProfileRequest;
import com.blogverse.user.dto.response.ApiResponse;
import com.blogverse.user.dto.response.UserProfileResponse;
import com.blogverse.user.dto.response.UserSummaryResponse;
import com.blogverse.user.security.UserPrincipal;
import com.blogverse.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User profiles, follow/unfollow, social graphs")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Not authenticated"));
        }
        UserProfileResponse profile = userService.getUserProfile(principal.getUserId(), principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getUserId() : null;
        UserProfileResponse profile = userService.getUserProfile(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || !principal.getUserId().equals(id)) {
            return ResponseEntity.status(403).body(ApiResponse.error(403, "You can only update your own profile"));
        }
        UserProfileResponse updated = userService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PostMapping("/{id}/follow")
    @Operation(summary = "Follow a user")
    public ResponseEntity<ApiResponse<Void>> followUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Not authenticated"));
        }
        userService.followUser(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("User followed successfully", null));
    }

    @DeleteMapping("/{id}/follow")
    @Operation(summary = "Unfollow a user")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Not authenticated"));
        }
        userService.unfollowUser(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.success("User unfollowed successfully", null));
    }

    @GetMapping("/{id}/followers")
    @Operation(summary = "Get followers list")
    public ResponseEntity<ApiResponse<Page<UserSummaryResponse>>> getFollowers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getUserId() : null;
        Page<UserSummaryResponse> followers = userService.getFollowers(id, currentUserId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(followers));
    }

    @GetMapping("/{id}/following")
    @Operation(summary = "Get following list")
    public ResponseEntity<ApiResponse<Page<UserSummaryResponse>>> getFollowing(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getUserId() : null;
        Page<UserSummaryResponse> following = userService.getFollowing(id, currentUserId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(following));
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Get recommended users to follow")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getSuggestions(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getUserId() : null;
        List<UserSummaryResponse> suggestions = userService.getSuggestedUsers(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }

    @PutMapping(value = "/me/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update user profile avatar image")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateAvatar(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Not authenticated"));
        }
        String fileName = "avatar_" + principal.getUserId() + "_" + System.currentTimeMillis() + ".jpg";
        String fakeMediaUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
        UserProfileResponse response = userService.updateAvatar(principal.getUserId(), fakeMediaUrl);
        return ResponseEntity.ok(ApiResponse.success("Avatar updated", response));
    }

    @GetMapping("/admin/metrics")
    @Operation(summary = "Get system admin metrics")
    public ResponseEntity<ApiResponse<com.blogverse.user.dto.response.AdminMetricsResponse>> getAdminMetrics() {
        com.blogverse.user.dto.response.AdminMetricsResponse metrics = userService.getAdminMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }
}
