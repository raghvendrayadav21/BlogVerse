package com.blogverse.interaction.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCommentRequest {

    @NotBlank(message = "Comment content cannot be empty")
    private String content;

    private Long parentCommentId;
}
