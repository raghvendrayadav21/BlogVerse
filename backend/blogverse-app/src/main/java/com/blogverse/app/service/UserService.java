package com.blogverse.app.service;

import com.blogverse.app.model.Follow;
import com.blogverse.app.model.User;
import com.blogverse.app.repository.FollowRepository;
import com.blogverse.app.repository.PostRepository;
import com.blogverse.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;

    public User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    public User updateProfile(Long userId, Map<String, Object> updates) {
        User user = getUser(userId);
        if (updates.containsKey("bio")) user.setBio((String) updates.get("bio"));
        if (updates.containsKey("website")) user.setWebsite((String) updates.get("website"));
        if (updates.containsKey("username")) {
            String newUsername = (String) updates.get("username");
            if (!newUsername.equals(user.getUsername()) && userRepository.existsByUsername(newUsername)) {
                throw new IllegalArgumentException("Username already taken: " + newUsername);
            }
            user.setUsername(newUsername);
        }
        return userRepository.save(user);
    }

    public String updateAvatar(Long userId, MultipartFile file) throws IOException {
        User user = getUser(userId);

        // Save file locally under uploads/
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
        Path filePath = uploadDir.resolve(filename);
        file.transferTo(filePath);

        String url = "/uploads/" + filename;
        user.setProfileImageUrl(url);
        userRepository.save(user);
        return url;
    }

    public void followUser(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return; // Already following, idempotent
        }
        getUser(followingId); // Validate target exists

        Follow follow = Follow.builder().id(UUID.randomUUID().toString())
                .followerId(followerId).followingId(followingId).build();
        followRepository.save(follow);

        // Update counts
        User follower = getUser(followerId);
        User following = getUser(followingId);
        follower.setFollowingCount(follower.getFollowingCount() + 1);
        following.setFollowersCount(following.getFollowersCount() + 1);
        userRepository.save(follower);
        userRepository.save(following);
    }

    public void unfollowUser(Long followerId, Long followingId) {
        followRepository.findByFollowerIdAndFollowingId(followerId, followingId).ifPresent(follow -> {
            followRepository.delete(follow);
            User follower = userRepository.findById(followerId).orElse(null);
            User following = userRepository.findById(followingId).orElse(null);
            if (follower != null) {
                follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
                userRepository.save(follower);
            }
            if (following != null) {
                following.setFollowersCount(Math.max(0, following.getFollowersCount() - 1));
                userRepository.save(following);
            }
        });
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    public Page<User> getFollowers(Long userId, int page, int size) {
        List<Follow> follows = followRepository.findByFollowingId(userId);
        List<Long> followerIds = follows.stream().map(Follow::getFollowerId).collect(Collectors.toList());
        List<User> followers = userRepository.findAllById(followerIds);
        int start = Math.min(page * size, followers.size());
        int end = Math.min(start + size, followers.size());
        return new PageImpl<>(followers.subList(start, end), PageRequest.of(page, size), followers.size());
    }

    public Page<User> getFollowing(Long userId, int page, int size) {
        List<Follow> follows = followRepository.findByFollowerId(userId);
        List<Long> followingIds = follows.stream().map(Follow::getFollowingId).collect(Collectors.toList());
        List<User> following = userRepository.findAllById(followingIds);
        int start = Math.min(page * size, following.size());
        int end = Math.min(start + size, following.size());
        return new PageImpl<>(following.subList(start, end), PageRequest.of(page, size), following.size());
    }

    public List<User> getSuggestedUsers(Long currentUserId) {
        // Return users not followed by current user (limit 10)
        List<Follow> myFollows = followRepository.findByFollowerId(currentUserId);
        List<Long> followingIds = myFollows.stream().map(Follow::getFollowingId).collect(Collectors.toList());
        followingIds.add(currentUserId); // exclude self

        return userRepository.findAll().stream()
                .filter(u -> !followingIds.contains(u.getId()) && u.isActive())
                .limit(10)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getAdminMetrics() {
        long totalUsers = userRepository.count();
        long publishedPosts = postRepository.countByStatus("PUBLISHED");
        return Map.of(
                "totalUsers", totalUsers,
                "publishedPosts", publishedPosts,
                "totalInteractions", 0,
                "pendingReports", 0
        );
    }
}
