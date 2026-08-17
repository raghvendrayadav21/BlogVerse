package com.blogverse.interaction.controller;

import com.blogverse.interaction.dto.request.CreateCommentRequest;
import com.blogverse.interaction.dto.request.CreateReportRequest;
import com.blogverse.interaction.dto.response.ApiResponse;
import com.blogverse.interaction.dto.response.CommentResponse;
import com.blogverse.interaction.security.UserPrincipal;
import com.blogverse.interaction.service.InteractionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Interactions", description = "Likes, Comments, Shares, Bookmarks, and Reports")
public class InteractionController {

    private final InteractionService interactionService;

    @PostMapping("/{postId}/like")
    @Operation(summary = "Like a post")
    public ResponseEntity<ApiResponse<Void>> likePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        interactionService.likePost(postId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Post liked", null));
    }

    @DeleteMapping("/{postId}/like")
    @Operation(summary = "Unlike a post")
    public ResponseEntity<ApiResponse<Void>> unlikePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        interactionService.unlikePost(postId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Post unliked", null));
    }

    @PostMapping("/{postId}/comments")
    @Operation(summary = "Add comment to post")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        CommentResponse comment = interactionService.createComment(
                postId, principal.getUserId(), principal.getUsername(), null, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Comment added successfully", comment));
    }

    @GetMapping("/{postId}/comments")
    @Operation(summary = "Get threaded comments for post")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<CommentResponse> comments = interactionService.getCommentsForPost(postId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @PostMapping("/{postId}/share")
    @Operation(summary = "Share/Repost a post")
    public ResponseEntity<ApiResponse<Void>> sharePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        interactionService.sharePost(postId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Post shared", null));
    }

    @PostMapping("/{postId}/bookmark")
    @Operation(summary = "Bookmark a post")
    public ResponseEntity<ApiResponse<Void>> bookmarkPost(
            @PathVariable Long postId,
            @RequestParam(required = false) String collectionName,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        interactionService.bookmarkPost(postId, principal.getUserId(), collectionName);
        return ResponseEntity.ok(ApiResponse.success("Post bookmarked", null));
    }

    @DeleteMapping("/{postId}/bookmark")
    @Operation(summary = "Remove bookmark for post")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        interactionService.removeBookmark(postId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Bookmark removed", null));
    }

    @PostMapping("/{postId}/report")
    @Operation(summary = "Report post for inappropriate content")
    public ResponseEntity<ApiResponse<Void>> reportPost(
            @PathVariable Long postId,
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        interactionService.reportContent(principal.getUserId(), postId, null, request);
        return ResponseEntity.ok(ApiResponse.success("Report submitted for review", null));
    }

    @GetMapping("/bookmarks/user")
    @Operation(summary = "Get current user bookmarks")
    public ResponseEntity<ApiResponse<Page<com.blogverse.interaction.dto.response.BookmarkResponse>>> getUserBookmarks(
            @RequestParam(required = false) String collectionName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        Page<com.blogverse.interaction.dto.response.BookmarkResponse> bookmarks =
                interactionService.getUserBookmarks(principal.getUserId(), collectionName, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(bookmarks));
    }

    @GetMapping("/reports")
    @Operation(summary = "Get pending reports queue (Admin)")
    public ResponseEntity<ApiResponse<Page<com.blogverse.interaction.dto.response.ReportResponse>>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<com.blogverse.interaction.dto.response.ReportResponse> reports =
                interactionService.getPendingReports(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/user/{userId}/liked")
    @Operation(summary = "Get post IDs liked by user")
    public ResponseEntity<ApiResponse<java.util.List<Long>>> getUserLikedPosts(@PathVariable Long userId) {
        java.util.List<Long> likedPostIds = interactionService.getUserLikedPostIds(userId);
        return ResponseEntity.ok(ApiResponse.success(likedPostIds));
    }

    @PutMapping("/reports/{reportId}/resolve")
    @Operation(summary = "Resolve pending report (Admin)")
    public ResponseEntity<ApiResponse<Void>> resolveReport(@PathVariable Long reportId) {
        interactionService.resolveReport(reportId);
        return ResponseEntity.ok(ApiResponse.success("Report resolved", null));
    }
}
