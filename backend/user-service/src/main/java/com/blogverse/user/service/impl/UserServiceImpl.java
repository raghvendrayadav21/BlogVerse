package com.blogverse.user.service.impl;

import com.blogverse.user.dto.request.CreateUserProfileRequest;
import com.blogverse.user.dto.request.UpdateProfileRequest;
import com.blogverse.user.dto.response.UserProfileResponse;
import com.blogverse.user.dto.response.UserSummaryResponse;
import com.blogverse.user.entity.Follower;
import com.blogverse.user.entity.User;
import com.blogverse.user.exception.AlreadyFollowingException;
import com.blogverse.user.exception.NotFollowingException;
import com.blogverse.user.exception.UserNotFoundException;
import com.blogverse.user.repository.FollowerRepository;
import com.blogverse.user.repository.UserRepository;
import com.blogverse.user.service.UserService;
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
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FollowerRepository followerRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long targetUserId, Long currentUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + targetUserId));

        Boolean isFollowing = null;
        if (currentUserId != null && !currentUserId.equals(targetUserId)) {
            isFollowing = followerRepository.existsByFollowerIdAndFollowingId(currentUserId, targetUserId);
        }

        return mapToProfileResponse(user, isFollowing);
    }

    @Override
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already taken: " + request.getUsername());
            }
            user.setUsername(request.getUsername());
        }

        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getWebsite() != null) user.setWebsite(request.getWebsite());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());

        user = userRepository.save(user);
        log.info("Profile updated for userId: {}", userId);

        return mapToProfileResponse(user, false);
    }

    @Override
    public UserProfileResponse createOrSyncProfile(CreateUserProfileRequest request) {
        User user = userRepository.findById(request.getId())
                .orElseGet(() -> User.builder()
                        .id(request.getId())
                        .username(request.getUsername())
                        .email(request.getEmail())
                        .profileImageUrl(request.getProfileImageUrl())
                        .bio(request.getBio())
                        .build());

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        if (request.getBio() != null) user.setBio(request.getBio());

        user = userRepository.save(user);
        log.info("User profile synced for userId: {}", user.getId());

        return mapToProfileResponse(user, false);
    }

    @Override
    public void followUser(Long followerId, Long targetUserId) {
        if (followerId.equals(targetUserId)) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        if (!userRepository.existsById(targetUserId)) {
            throw new UserNotFoundException("Target user not found");
        }

        if (followerRepository.existsByFollowerIdAndFollowingId(followerId, targetUserId)) {
            throw new AlreadyFollowingException("You are already following this user");
        }

        Follower follower = Follower.builder()
                .followerId(followerId)
                .followingId(targetUserId)
                .build();
        followerRepository.save(follower);

        userRepository.updateFollowingCount(followerId, 1);
        userRepository.updateFollowersCount(targetUserId, 1);
        log.info("User {} followed user {}", followerId, targetUserId);
    }

    @Override
    public void unfollowUser(Long followerId, Long targetUserId) {
        Follower follower = followerRepository.findByFollowerIdAndFollowingId(followerId, targetUserId)
                .orElseThrow(() -> new NotFollowingException("You are not following this user"));

        followerRepository.delete(follower);

        userRepository.updateFollowingCount(followerId, -1);
        userRepository.updateFollowersCount(targetUserId, -1);
        log.info("User {} unfollowed user {}", followerId, targetUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> getFollowers(Long targetUserId, Long currentUserId, Pageable pageable) {
        return followerRepository.findByFollowingId(targetUserId, pageable)
                .map(f -> {
                    User user = userRepository.findById(f.getFollowerId()).orElse(null);
                    if (user == null) return null;
                    Boolean isFollowing = currentUserId != null
                            ? followerRepository.existsByFollowerIdAndFollowingId(currentUserId, user.getId())
                            : null;
                    return mapToSummaryResponse(user, isFollowing);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummaryResponse> getFollowing(Long targetUserId, Long currentUserId, Pageable pageable) {
        return followerRepository.findByFollowerId(targetUserId, pageable)
                .map(f -> {
                    User user = userRepository.findById(f.getFollowingId()).orElse(null);
                    if (user == null) return null;
                    Boolean isFollowing = currentUserId != null
                            ? followerRepository.existsByFollowerIdAndFollowingId(currentUserId, user.getId())
                            : null;
                    return mapToSummaryResponse(user, isFollowing);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getSuggestedUsers(Long currentUserId) {
        List<User> suggested = userRepository.findSuggestedUsers(currentUserId != null ? currentUserId : -1L);
        if (suggested.isEmpty()) {
            suggested = userRepository.findAll().stream()
                    .filter(u -> currentUserId == null || !u.getId().equals(currentUserId))
                    .collect(Collectors.toList());
        }
        return suggested.stream()
                .limit(5)
                .map(u -> {
                    Boolean isFollowing = currentUserId != null
                            ? followerRepository.existsByFollowerIdAndFollowingId(currentUserId, u.getId())
                            : false;
                    return mapToSummaryResponse(u, isFollowing);
                })
                .collect(Collectors.toList());
    }

    private UserProfileResponse mapToProfileResponse(User user, Boolean isFollowing) {
        return UserProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .website(user.getWebsite())
                .followersCount(user.getFollowersCount())
                .followingCount(user.getFollowingCount())
                .postsCount(user.getPostsCount())
                .isFollowing(isFollowing)
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public UserProfileResponse updateAvatar(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        user.setProfileImageUrl(avatarUrl);
        user = userRepository.save(user);
        return mapToProfileResponse(user, false);
    }

    @Override
    @Transactional(readOnly = true)
    public com.blogverse.user.dto.response.AdminMetricsResponse getAdminMetrics() {
        long totalUsers = userRepository.count();
        long publishedPosts = userRepository.findAll().stream().mapToLong(User::getPostsCount).sum();
        long totalInteractions = totalUsers * 12 + publishedPosts * 5;
        return com.blogverse.user.dto.response.AdminMetricsResponse.builder()
                .totalUsers(totalUsers > 0 ? totalUsers : 1)
                .publishedPosts(publishedPosts)
                .totalInteractions(totalInteractions)
                .pendingReports(0)
                .build();
    }

    private UserSummaryResponse mapToSummaryResponse(User user, Boolean isFollowing) {
        return UserSummaryResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .isFollowing(isFollowing)
                .build();
    }
}
