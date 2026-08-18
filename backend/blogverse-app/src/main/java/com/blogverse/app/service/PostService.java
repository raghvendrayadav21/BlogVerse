package com.blogverse.app.service;

import com.blogverse.app.dto.request.CreatePostRequest;
import com.blogverse.app.model.*;
import com.blogverse.app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final CommentRepository commentRepository;
    private final SequenceGeneratorService sequenceGenerator;

    public Post createPost(Long userId, CreatePostRequest req, boolean isDraft) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String status = isDraft ? "DRAFT" : (req.getStatus() != null ? req.getStatus() : "PUBLISHED");
        String content = req.getContent() != null ? req.getContent() : "";
        int wordCount = content.split("\\s+").length;
        int readTime = Math.max(1, wordCount / 200);

        // Accept tags or hashtags from payload
        List<String> postTags = req.getTags();
        if (postTags == null || postTags.isEmpty()) {
            // Also check req.getHashtags if it maps in any payload
            postTags = new ArrayList<>();
        }

        Post post = Post.builder()
                .id(sequenceGenerator.generateSequence(SequenceGeneratorService.POST_SEQ))
                .userId(userId)
                .username(author.getUsername())
                .userProfileImage(author.getProfileImageUrl())
                .authorBio(author.getBio())
                .title(req.getTitle())
                .content(content)
                .excerpt(req.getExcerpt() != null ? req.getExcerpt() : truncate(content, 200))
                .coverImageUrl(req.getCoverImageUrl())
                .status(status)
                .hashtags(postTags)
                .readingTimeMinutes(readTime)
                .build();

        post = postRepository.save(post);

        // Update author post count
        author.setPostsCount(author.getPostsCount() + 1);
        userRepository.save(author);

        return post;
    }

    public Post updatePost(Long postId, Long userId, CreatePostRequest req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to edit this post");
        }

        if (req.getTitle() != null) post.setTitle(req.getTitle());
        if (req.getContent() != null) {
            post.setContent(req.getContent());
            post.setExcerpt(truncate(req.getContent(), 200));
        }
        if (req.getExcerpt() != null) post.setExcerpt(req.getExcerpt());
        if (req.getCoverImageUrl() != null) post.setCoverImageUrl(req.getCoverImageUrl());
        if (req.getStatus() != null) post.setStatus(req.getStatus());
        if (req.getTags() != null) post.setHashtags(req.getTags());
        post.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        if (!post.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to delete this post");
        }
        postRepository.delete(post);
    }

    public Post getPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        post.setViewCount(post.getViewCount() + 1);
        return postRepository.save(post);
    }

    public Page<Post> getFeed(int page, int size) {
        return postRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", PageRequest.of(page, size));
    }

    public Page<Post> getTrending(int page, int size) {
        return postRepository.findByStatusOrderByLikesCountDesc("PUBLISHED", PageRequest.of(page, size));
    }

    public Page<Post> getUserPosts(Long userId, int page, int size) {
        return postRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "PUBLISHED", PageRequest.of(page, size));
    }

    public Page<Post> getHashtagPosts(String tag, int page, int size) {
        return postRepository.findByHashtagsContainingAndStatusOrderByCreatedAtDesc(tag, "PUBLISHED", PageRequest.of(page, size));
    }

    public List<Post> getUserDrafts(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 50))
                .stream().filter(p -> "DRAFT".equals(p.getStatus())).collect(Collectors.toList());
    }

    public void likePost(Long postId, Long userId) {
        if (likeRepository.existsByUserIdAndPostId(userId, postId)) return;
        Like like = Like.builder().id(UUID.randomUUID().toString()).userId(userId).postId(postId).build();
        likeRepository.save(like);
        postRepository.findById(postId).ifPresent(post -> {
            post.setLikesCount(post.getLikesCount() + 1);
            postRepository.save(post);
        });
    }

    public void unlikePost(Long postId, Long userId) {
        likeRepository.findByUserIdAndPostId(userId, postId).ifPresent(like -> {
            likeRepository.delete(like);
            postRepository.findById(postId).ifPresent(post -> {
                post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
                postRepository.save(post);
            });
        });
    }

    public void bookmarkPost(Long postId, Long userId, String collectionName) {
        if (bookmarkRepository.existsByUserIdAndPostId(userId, postId)) return;
        Bookmark bookmark = Bookmark.builder().id(UUID.randomUUID().toString())
                .userId(userId).postId(postId)
                .collectionName(collectionName != null ? collectionName : "default").build();
        bookmarkRepository.save(bookmark);
        postRepository.findById(postId).ifPresent(post -> {
            post.setBookmarksCount(post.getBookmarksCount() + 1);
            postRepository.save(post);
        });
    }

    public void removeBookmark(Long postId, Long userId) {
        bookmarkRepository.findByUserIdAndPostId(userId, postId).ifPresent(bookmark -> {
            bookmarkRepository.delete(bookmark);
            postRepository.findById(postId).ifPresent(post -> {
                post.setBookmarksCount(Math.max(0, post.getBookmarksCount() - 1));
                postRepository.save(post);
            });
        });
    }

    public void sharePost(Long postId) {
        postRepository.findById(postId).ifPresent(post -> {
            post.setSharesCount(post.getSharesCount() + 1);
            postRepository.save(post);
        });
    }

    public Page<Post> getUserBookmarkedPosts(Long userId, int page, int size) {
        Page<Bookmark> bookmarks = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
        List<Long> postIds = bookmarks.stream().map(Bookmark::getPostId).collect(Collectors.toList());
        List<Post> posts = postRepository.findAllById(postIds);
        return new PageImpl<>(posts, PageRequest.of(page, size), bookmarks.getTotalElements());
    }

    public List<Long> getUserLikedPostIds(Long userId) {
        return likeRepository.findByUserId(userId).stream().map(Like::getPostId).collect(Collectors.toList());
    }

    public Comment addComment(Long postId, Long userId, String content, Long parentCommentId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Comment comment = Comment.builder()
                .id(sequenceGenerator.generateSequence(SequenceGeneratorService.COMMENT_SEQ))
                .postId(postId).authorId(userId)
                .authorUsername(author.getUsername())
                .authorProfileImageUrl(author.getProfileImageUrl())
                .content(content).parentCommentId(parentCommentId).build();
        Comment saved = commentRepository.save(comment);
        postRepository.findById(postId).ifPresent(post -> {
            post.setCommentsCount(post.getCommentsCount() + 1);
            postRepository.save(post);
        });
        return saved;
    }

    public Page<Comment> getComments(Long postId, int page, int size) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId, PageRequest.of(page, size));
    }

    public List<Map<String, Object>> getTrendingTags() {
        Map<String, Long> tagCounts = new HashMap<>();
        postRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", PageRequest.of(0, 200))
                .forEach(post -> post.getHashtags().forEach(tag -> tagCounts.merge(tag, 1L, Long::sum)));

        List<Map<String, Object>> result = new ArrayList<>();
        long[] idCounter = {1};
        tagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(20)
                .forEach(e -> result.add(Map.of("id", idCounter[0]++, "name", e.getKey(), "postCount", e.getValue())));
        return result;
    }

    public boolean isLiked(Long postId, Long userId) {
        return likeRepository.existsByUserIdAndPostId(userId, postId);
    }

    public boolean isBookmarked(Long postId, Long userId) {
        return bookmarkRepository.existsByUserIdAndPostId(userId, postId);
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "...";
    }
}
