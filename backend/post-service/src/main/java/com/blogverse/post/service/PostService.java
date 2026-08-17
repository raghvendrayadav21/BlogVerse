package com.blogverse.post.service;

import com.blogverse.post.dto.request.CreatePostRequest;
import com.blogverse.post.dto.response.PostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostService {

    PostResponse createPost(Long userId, String username, String profileImage, CreatePostRequest request);

    PostResponse getPostById(Long id);

    PostResponse updatePost(Long postId, Long userId, CreatePostRequest request);

    void deletePost(Long postId, Long userId, boolean isAdmin);

    Page<PostResponse> getFeed(Long userId, Pageable pageable);

    Page<PostResponse> getTrending(Pageable pageable);

    Page<PostResponse> getUserPosts(Long targetUserId, Pageable pageable);

    Page<PostResponse> getPostsByHashtag(String hashtag, Pageable pageable);

    java.util.List<com.blogverse.post.entity.Hashtag> getTrendingHashtags();
}
