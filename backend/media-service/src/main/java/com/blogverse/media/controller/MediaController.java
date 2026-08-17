package com.blogverse.media.controller;

import com.blogverse.media.dto.response.ApiResponse;
import com.blogverse.media.dto.response.MediaResponse;
import com.blogverse.media.security.UserPrincipal;
import com.blogverse.media.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Tag(name = "Media Management", description = "Image and Video upload to S3/MinIO")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image or video file to S3/MinIO")
    public ResponseEntity<ApiResponse<MediaResponse>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "postId", required = false) Long postId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        MediaResponse response = mediaService.uploadMedia(principal.getUserId(), file, postId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Media uploaded successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get media details by ID")
    public ResponseEntity<ApiResponse<MediaResponse>> getMedia(@PathVariable Long id) {
        MediaResponse response = mediaService.getMediaById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete media file")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Authentication required"));
        }
        mediaService.deleteMedia(id, principal.getUserId(), principal.isAdmin());
        return ResponseEntity.ok(ApiResponse.success("Media deleted successfully", null));
    }
}
