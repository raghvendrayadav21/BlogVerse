package com.blogverse.user.service;

import com.blogverse.user.dto.request.UpdateProfileRequest;
import com.blogverse.user.dto.response.UserProfileResponse;
import com.blogverse.user.entity.User;
import com.blogverse.user.exception.UserNotFoundException;
import com.blogverse.user.repository.FollowerRepository;
import com.blogverse.user.repository.UserRepository;
import com.blogverse.user.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FollowerRepository followerRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("blogmaster")
                .email("master@blogverse.app")
                .bio("Writing code & articles")
                .followersCount(10)
                .followingCount(5)
                .postsCount(3)
                .build();
    }

    @Test
    @DisplayName("Should retrieve user profile by ID")
    void getUserProfile_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(followerRepository.existsByFollowerIdAndFollowingId(2L, 1L)).thenReturn(true);

        UserProfileResponse response = userService.getUserProfile(1L, 2L);

        assertNotNull(response);
        assertEquals("blogmaster", response.getUsername());
        assertTrue(response.getIsFollowing());
    }

    @Test
    @DisplayName("Should throw exception when target user does not exist")
    void getUserProfile_NotFound_ThrowsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userService.getUserProfile(99L, 1L));
    }

    @Test
    @DisplayName("Should follow user and increment counters")
    void followUser_Success() {
        when(userRepository.existsById(2L)).thenReturn(true);
        when(followerRepository.existsByFollowerIdAndFollowingId(1L, 2L)).thenReturn(false);

        userService.followUser(1L, 2L);

        verify(followerRepository, times(1)).save(any());
        verify(userRepository, times(1)).updateFollowingCount(1L, 1);
        verify(userRepository, times(1)).updateFollowersCount(2L, 1);
    }
}
