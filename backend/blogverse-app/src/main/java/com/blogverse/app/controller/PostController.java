package com.blogverse.app.controller;

import com.blogverse.app.dto.request.CreatePostRequest;
import com.blogverse.app.exception.ApiResponse;
import com.blogverse.app.model.Comment;
import com.blogverse.app.model.Post;
import com.blogverse.app.security.UserPrincipal;
import com.blogverse.app.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // ── Feed & Discovery ─────────────────────────────────────────────

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<Page<Post>>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Feed fetched", postService.getFeed(page, size)));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Page<Post>>> getTrending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Trending fetched", postService.getTrending(page, size)));
    }

    @GetMapping("/tags/trending")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTrendingTags() {
        return ResponseEntity.ok(ApiResponse.success("Tags fetched", postService.getTrendingTags()));
    }

    @GetMapping("/hashtag/{tag}")
    public ResponseEntity<ApiResponse<Page<Post>>> getHashtagPosts(
            @PathVariable String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Posts fetched", postService.getHashtagPosts(tag, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Post fetched", postService.getPost(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<Post>>> getUserPosts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Posts fetched", postService.getUserPosts(userId, page, size)));
    }

    // ── CRUD ─────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<Post>> createPost(
            @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Post post = postService.createPost(principal.getUserId(), request, false);
        return ResponseEntity.status(201).body(ApiResponse.created("Post created", post));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> updatePost(
            @PathVariable Long id,
            @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Post post = postService.updatePost(id, principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Post updated", post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        postService.deletePost(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Post deleted", null));
    }

    // ── Drafts ───────────────────────────────────────────────────────

    @PostMapping("/drafts")
    public ResponseEntity<ApiResponse<Post>> saveDraft(
            @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Post post = postService.createPost(principal.getUserId(), request, true);
        return ResponseEntity.status(201).body(ApiResponse.created("Draft saved", post));
    }

    @GetMapping("/drafts")
    public ResponseEntity<ApiResponse<List<Post>>> getDrafts(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Drafts fetched", postService.getUserDrafts(principal.getUserId())));
    }

    // ── Interactions ─────────────────────────────────────────────────

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> like(
            @PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        postService.likePost(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Liked", null));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> unlike(
            @PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        postService.unlikePost(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Unliked", null));
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> bookmark(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String col = body != null ? body.get("collectionName") : null;
        postService.bookmarkPost(id, principal.getUserId(), col);
        return ResponseEntity.ok(ApiResponse.success("Bookmarked", null));
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        postService.removeBookmark(id, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Bookmark removed", null));
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<ApiResponse<Void>> share(@PathVariable Long id) {
        postService.sharePost(id);
        return ResponseEntity.ok(ApiResponse.success("Shared", null));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<ApiResponse<Void>> report(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Reported", null));
    }

    // ── Comments ─────────────────────────────────────────────────────

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Page<Comment>>> getComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Comments fetched", postService.getComments(id, page, size)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Comment>> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String content = (String) body.get("content");
        Long parentId = body.get("parentCommentId") != null
                ? Long.parseLong(body.get("parentCommentId").toString()) : null;
        Comment comment = postService.addComment(id, principal.getUserId(), content, parentId);
        return ResponseEntity.status(201).body(ApiResponse.created("Comment added", comment));
    }

    // ── Bookmarks (user level) ────────────────────────────────────────

    @GetMapping("/bookmarks/user")
    public ResponseEntity<ApiResponse<Page<Post>>> getUserBookmarks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Bookmarks fetched",
                postService.getUserBookmarkedPosts(principal.getUserId(), page, size)));
    }

    @GetMapping("/user/{userId}/liked")
    public ResponseEntity<ApiResponse<List<Long>>> getLikedPostIds(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Liked posts fetched", postService.getUserLikedPostIds(userId)));
    }

    // ── Admin Reports (stub) ──────────────────────────────────────────

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Page<Object>>> getReports(
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(ApiResponse.success("Reports fetched",
                org.springframework.data.domain.Page.empty()));
    }

    @PutMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(ApiResponse.success("Report resolved", null));
    }
}
