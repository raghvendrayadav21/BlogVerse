package com.blogverse.media.service;

import com.blogverse.media.dto.response.MediaResponse;
import org.springframework.web.multipart.MultipartFile;

public interface MediaService {
    MediaResponse uploadMedia(Long userId, MultipartFile file, Long postId);
    MediaResponse getMediaById(Long id);
    void deleteMedia(Long id, Long userId, boolean isAdmin);
}
