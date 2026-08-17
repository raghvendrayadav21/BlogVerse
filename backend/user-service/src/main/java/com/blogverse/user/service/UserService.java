package com.blogverse.user.service;

import com.blogverse.user.dto.request.CreateUserProfileRequest;
import com.blogverse.user.dto.request.UpdateProfileRequest;
import com.blogverse.user.dto.response.UserProfileResponse;
import com.blogverse.user.dto.response.UserSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserProfileResponse getUserProfile(Long targetUserId, Long currentUserId);

    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);

    UserProfileResponse createOrSyncProfile(CreateUserProfileRequest request);

    void followUser(Long followerId, Long targetUserId);

    void unfollowUser(Long followerId, Long targetUserId);

    Page<UserSummaryResponse> getFollowers(Long targetUserId, Long currentUserId, Pageable pageable);

    Page<UserSummaryResponse> getFollowing(Long targetUserId, Long currentUserId, Pageable pageable);

    List<UserSummaryResponse> getSuggestedUsers(Long currentUserId);

    UserProfileResponse updateAvatar(Long userId, String avatarUrl);

    com.blogverse.user.dto.response.AdminMetricsResponse getAdminMetrics();
}
