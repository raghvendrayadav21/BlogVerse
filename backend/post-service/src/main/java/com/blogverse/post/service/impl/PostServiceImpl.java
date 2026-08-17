package com.blogverse.post.service.impl;

import com.blogverse.post.dto.request.CreatePostRequest;
import com.blogverse.post.dto.response.PostResponse;
import com.blogverse.post.entity.Hashtag;
import com.blogverse.post.entity.Post;
import com.blogverse.post.exception.PostNotFoundException;
import com.blogverse.post.repository.HashtagRepository;
import com.blogverse.post.repository.PostRepository;
import com.blogverse.post.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final HashtagRepository hashtagRepository;

    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#(\\w+)");

    @Override
    public PostResponse createPost(Long userId, String username, String profileImage, CreatePostRequest request) {
        log.info("Creating post for userId: {}", userId);

        Set<String> extractedTags = extractHashtags(request.getContent());
        if (request.getHashtags() != null) {
            extractedTags.addAll(request.getHashtags());
        }

        // Process hashtags
        extractedTags.forEach(this::processHashtag);

        int readingTime = calculateReadingTime(request.getContent());

        Post post = Post.builder()
                .userId(userId)
                .username(username != null && !username.isBlank() ? username : ("user_" + userId))
                .userProfileImage(profileImage)
                .title(request.getTitle())
                .content(request.getContent())
                .postType(request.getPostType() != null ? request.getPostType() : Post.PostType.TEXT)
                .visibility(request.getVisibility() != null ? request.getVisibility() : Post.Visibility.PUBLIC)
                .readingTimeMinutes(readingTime)
                .hashtags(extractedTags)
                .build();

        post.updateTrendingScore();
        post = postRepository.save(post);
        log.info("Post created with ID: {}", post.getId());

        return mapToResponse(post);
    }

    @Override
    @Transactional
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found with ID: " + id));

        postRepository.incrementViewCount(id);
        post.setViewCount(post.getViewCount() + 1);
        post.updateTrendingScore();

        return mapToResponse(post);
    }

    @Override
    public PostResponse updatePost(Long postId, Long userId, CreatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with ID: " + postId));

        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own posts");
        }

        if (request.getTitle() != null) post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setReadingTimeMinutes(calculateReadingTime(request.getContent()));

        Set<String> extractedTags = extractHashtags(request.getContent());
        if (request.getHashtags() != null) extractedTags.addAll(request.getHashtags());
        post.setHashtags(extractedTags);

        post = postRepository.save(post);
        log.info("Post updated with ID: {}", postId);

        return mapToResponse(post);
    }

    @Override
    public void deletePost(Long postId, Long userId, boolean isAdmin) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with ID: " + postId));

        if (!isAdmin && !post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own posts");
        }

        postRepository.delete(post);
        log.info("Post deleted with ID: {}", postId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(Long userId, Pageable pageable) {
        // Return public posts for home feed
        return postRepository.findByVisibilityOrderByCreatedAtDesc(Post.Visibility.PUBLIC, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getTrending(Pageable pageable) {
        return postRepository.findTrendingPosts(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getUserPosts(Long targetUserId, Pageable pageable) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(targetUserId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByHashtag(String hashtag, Pageable pageable) {
        String cleanTag = hashtag.startsWith("#") ? hashtag.substring(1) : hashtag;
        return postRepository.findByHashtag(cleanTag, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<Hashtag> getTrendingHashtags() {
        return hashtagRepository.findTopTrendingHashtags();
    }

    private Set<String> extractHashtags(String content) {
        Set<String> tags = new HashSet<>();
        if (content == null) return tags;
        Matcher matcher = HASHTAG_PATTERN.matcher(content);
        while (matcher.find()) {
            tags.add(matcher.group(1).toLowerCase());
        }
        return tags;
    }

    private void processHashtag(String tag) {
        String clean = tag.toLowerCase();
        Hashtag hashtag = hashtagRepository.findByName(clean)
                .orElseGet(() -> Hashtag.builder().name(clean).postCount(0).build());
        hashtag.setPostCount(hashtag.getPostCount() + 1);
        hashtagRepository.save(hashtag);
    }

    private int calculateReadingTime(String content) {
        if (content == null || content.isBlank()) return 1;
        int words = content.trim().split("\\s+").length;
        return (int) Math.max(1, Math.ceil(words / 200.0));
    }

    private PostResponse mapToResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUserId())
                .username(post.getUsername())
                .userProfileImage(post.getUserProfileImage())
                .title(post.getTitle())
                .content(post.getContent())
                .postType(post.getPostType())
                .visibility(post.getVisibility())
                .readingTimeMinutes(post.getReadingTimeMinutes())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .shareCount(post.getShareCount())
                .viewCount(post.getViewCount())
                .trendingScore(post.getTrendingScore())
                .hashtags(post.getHashtags())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
