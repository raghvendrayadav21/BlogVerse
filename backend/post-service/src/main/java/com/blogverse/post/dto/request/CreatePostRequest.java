package com.blogverse.post.dto.request;

import com.blogverse.post.entity.Post;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class CreatePostRequest {

    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @NotBlank(message = "Post content cannot be empty")
    private String content;

    @NotNull(message = "Post type is required")
    private Post.PostType postType = Post.PostType.TEXT;

    private Post.Visibility visibility = Post.Visibility.PUBLIC;

    private Set<String> hashtags;
    private Set<Long> mediaIds;
}
