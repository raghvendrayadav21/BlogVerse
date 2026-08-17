package com.blogverse.media.dto.response;

import com.blogverse.media.entity.Media;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaResponse {

    private Long id;
    private Long userId;
    private Long postId;
    private Media.MediaType mediaType;
    private String s3Key;
    private String mediaUrl;
    private String originalFilename;
    private Long fileSize;
    private String mimeType;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}
