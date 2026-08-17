package com.blogverse.post.controller;

import com.blogverse.post.dto.request.CreatePostRequest;
import com.blogverse.post.dto.response.ApiResponse;
import com.blogverse.post.dto.response.PostResponse;
import com.blogverse.post.security.UserPrincipal;
import com.blogverse.post.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Post Management", description = "Create, read, update, delete posts, feed & trending")
public class PostController {

    private final PostService postService;

    @PostMapping
    @Operation(summary = "Create a new post or blog article")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        PostResponse post = postService.createPost(
                principal.getUserId(),
                principal.getUsername(),
                null,
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Post created successfully", post));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get post by ID")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(@PathVariable Long id) {
        PostResponse post = postService.getPostById(id);
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update post")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody CreatePostRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        PostResponse updated = postService.updatePost(id, principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Post updated", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete post")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        postService.deletePost(id, principal.getUserId(), principal.isAdmin());
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }

    @GetMapping("/feed")
    @Operation(summary = "Get main home feed")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = principal != null ? principal.getUserId() : null;
        Page<PostResponse> feed = postService.getFeed(currentUserId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(feed));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending posts")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getTrending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PostResponse> trending = postService.getTrending(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(trending));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get posts by user ID")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getUserPosts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PostResponse> posts = postService.getUserPosts(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/hashtag/{tag}")
    @Operation(summary = "Get posts by hashtag")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getHashtagPosts(
            @PathVariable String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PostResponse> posts = postService.getPostsByHashtag(tag, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/tags/trending")
    @Operation(summary = "Get top trending hashtags list")
    public ResponseEntity<ApiResponse<java.util.List<com.blogverse.post.entity.Hashtag>>> getTrendingHashtags() {
        return ResponseEntity.ok(ApiResponse.success(postService.getTrendingHashtags()));
    }
}
