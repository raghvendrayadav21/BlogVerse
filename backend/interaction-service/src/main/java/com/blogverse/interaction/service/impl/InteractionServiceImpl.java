package com.blogverse.interaction.service.impl;

import com.blogverse.interaction.dto.request.CreateCommentRequest;
import com.blogverse.interaction.dto.request.CreateReportRequest;
import com.blogverse.interaction.dto.response.CommentResponse;
import com.blogverse.interaction.entity.*;
import com.blogverse.interaction.repository.*;
import com.blogverse.interaction.service.InteractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InteractionServiceImpl implements InteractionService {

    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final BookmarkRepository bookmarkRepository;
    private final ShareRepository shareRepository;
    private final ReportRepository reportRepository;

    @Override
    public void likePost(Long postId, Long userId) {
        if (likeRepository.existsByPostIdAndUserId(postId, userId)) {
            throw new IllegalArgumentException("You have already liked this post");
        }
        Like like = Like.builder().postId(postId).userId(userId).build();
        likeRepository.save(like);
        log.info("User {} liked post {}", userId, postId);
    }

    @Override
    public void unlikePost(Long postId, Long userId) {
        Like like = likeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new IllegalArgumentException("You have not liked this post"));
        likeRepository.delete(like);
        log.info("User {} unliked post {}", userId, postId);
    }

    @Override
    public CommentResponse createComment(Long postId, Long userId, String username, String userProfileImage, CreateCommentRequest request) {
        Comment comment = Comment.builder()
                .postId(postId)
                .userId(userId)
                .username(username != null ? username : "anonymous")
                .userProfileImage(userProfileImage)
                .parentCommentId(request.getParentCommentId())
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);
        log.info("User {} commented on post {}", userId, postId);
        return mapToCommentResponse(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsForPost(Long postId, Pageable pageable) {
        return commentRepository.findByPostIdAndParentCommentIdIsNullOrderByCreatedAtDesc(postId, pageable)
                .map(comment -> {
                    CommentResponse res = mapToCommentResponse(comment);
                    List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
                    res.setReplies(replies.stream().map(this::mapToCommentResponse).collect(Collectors.toList()));
                    return res;
                });
    }

    @Override
    public void deleteComment(Long commentId, Long userId, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        if (!isAdmin && !comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
        log.info("Deleted comment {}", commentId);
    }

    @Override
    public void sharePost(Long postId, Long userId) {
        Share share = Share.builder().postId(postId).userId(userId).build();
        shareRepository.save(share);
        log.info("User {} shared post {}", userId, postId);
    }

    @Override
    public void bookmarkPost(Long postId, Long userId, String collectionName) {
        if (bookmarkRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new IllegalArgumentException("Post is already bookmarked");
        }
        Bookmark bookmark = Bookmark.builder()
                .userId(userId)
                .postId(postId)
                .collectionName(collectionName != null ? collectionName : "Reading List")
                .build();
        bookmarkRepository.save(bookmark);
        log.info("User {} bookmarked post {}", userId, postId);
    }

    @Override
    public void removeBookmark(Long postId, Long userId) {
        Bookmark bookmark = bookmarkRepository.findByUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new IllegalArgumentException("Bookmark not found"));
        bookmarkRepository.delete(bookmark);
        log.info("User {} removed bookmark for post {}", userId, postId);
    }

    @Override
    public void reportContent(Long userId, Long postId, Long commentId, CreateReportRequest request) {
        Report report = Report.builder()
                .reporterId(userId)
                .postId(postId)
                .commentId(commentId)
                .reason(request.getReason())
                .description(request.getDescription())
                .status(Report.Status.PENDING)
                .build();
        reportRepository.save(report);
        log.info("User {} submitted a report for post {} / comment {}", userId, postId, commentId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<com.blogverse.interaction.dto.response.BookmarkResponse> getUserBookmarks(Long userId, String collectionName, Pageable pageable) {
        Page<Bookmark> page = (collectionName != null && !collectionName.isBlank() && !"All".equalsIgnoreCase(collectionName))
                ? bookmarkRepository.findByUserIdAndCollectionNameOrderByCreatedAtDesc(userId, collectionName, pageable)
                : bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return page.map(b -> com.blogverse.interaction.dto.response.BookmarkResponse.builder()
                .id(b.getId())
                .userId(b.getUserId())
                .postId(b.getPostId())
                .collectionName(b.getCollectionName())
                .createdAt(b.getCreatedAt())
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<com.blogverse.interaction.dto.response.ReportResponse> getPendingReports(Pageable pageable) {
        return reportRepository.findByStatusOrderByCreatedAtDesc(Report.Status.PENDING, pageable)
                .map(r -> com.blogverse.interaction.dto.response.ReportResponse.builder()
                        .id(r.getId())
                        .reporterUserId(r.getReporterId())
                        .postId(r.getPostId())
                        .commentId(r.getCommentId())
                        .reason(r.getReason() != null ? r.getReason().name() : null)
                        .description(r.getDescription())
                        .status(r.getStatus().name())
                        .createdAt(r.getCreatedAt())
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getUserLikedPostIds(Long userId) {
        return likeRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged())
                .getContent()
                .stream()
                .map(Like::getPostId)
                .collect(Collectors.toList());
    }

    @Override
    public void resolveReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        report.setStatus(Report.Status.RESOLVED);
        reportRepository.save(report);
        log.info("Report {} resolved by admin", reportId);
    }

    private CommentResponse mapToCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .userId(comment.getUserId())
                .username(comment.getUsername())
                .userProfileImage(comment.getUserProfileImage())
                .parentCommentId(comment.getParentCommentId())
                .content(comment.getContent())
                .likeCount(comment.getLikeCount())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
