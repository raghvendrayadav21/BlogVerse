package com.blogverse.interaction.service;

import com.blogverse.interaction.dto.request.CreateCommentRequest;
import com.blogverse.interaction.dto.request.CreateReportRequest;
import com.blogverse.interaction.dto.response.CommentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InteractionService {

    void likePost(Long postId, Long userId);

    void unlikePost(Long postId, Long userId);

    CommentResponse createComment(Long postId, Long userId, String username, String userProfileImage, CreateCommentRequest request);

    Page<CommentResponse> getCommentsForPost(Long postId, Pageable pageable);

    void deleteComment(Long commentId, Long userId, boolean isAdmin);

    void sharePost(Long postId, Long userId);

    void bookmarkPost(Long postId, Long userId, String collectionName);

    void removeBookmark(Long postId, Long userId);

    void reportContent(Long userId, Long postId, Long commentId, CreateReportRequest request);

    Page<com.blogverse.interaction.dto.response.BookmarkResponse> getUserBookmarks(Long userId, String collectionName, Pageable pageable);

    Page<com.blogverse.interaction.dto.response.ReportResponse> getPendingReports(Pageable pageable);

    java.util.List<Long> getUserLikedPostIds(Long userId);

    void resolveReport(Long reportId);
}
