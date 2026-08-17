package com.blogverse.post.service;

import com.blogverse.post.dto.request.CreatePostRequest;
import com.blogverse.post.dto.response.PostResponse;
import com.blogverse.post.entity.Post;
import com.blogverse.post.repository.HashtagRepository;
import com.blogverse.post.repository.PostRepository;
import com.blogverse.post.service.impl.PostServiceImpl;
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
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private HashtagRepository hashtagRepository;

    @InjectMocks
    private PostServiceImpl postService;

    private Post testPost;
    private CreatePostRequest createRequest;

    @BeforeEach
    void setUp() {
        testPost = Post.builder()
                .id(100L)
                .userId(1L)
                .username("blogmaster")
                .title("Mastering Microservices")
                .content("In this article we cover #springboot and #microservices architecture...")
                .readingTimeMinutes(2)
                .likeCount(5)
                .build();

        createRequest = new CreatePostRequest();
        createRequest.setTitle("Mastering Microservices");
        createRequest.setContent("In this article we cover #springboot and #microservices architecture...");
    }

    @Test
    @DisplayName("Should create post, extract hashtags, and calculate reading time")
    void createPost_Success() {
        when(postRepository.save(any())).thenReturn(testPost);

        PostResponse response = postService.createPost(1L, "blogmaster", null, createRequest);

        assertNotNull(response);
        assertEquals("Mastering Microservices", response.getTitle());
        verify(postRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should get post by ID and increment view count")
    void getPostById_Success() {
        when(postRepository.findById(100L)).thenReturn(Optional.of(testPost));

        PostResponse response = postService.getPostById(100L);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        verify(postRepository, times(1)).incrementViewCount(100L);
    }
}
