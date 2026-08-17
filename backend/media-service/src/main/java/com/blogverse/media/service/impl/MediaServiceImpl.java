package com.blogverse.media.service.impl;

import com.blogverse.media.dto.response.MediaResponse;
import com.blogverse.media.entity.Media;
import com.blogverse.media.repository.MediaRepository;
import com.blogverse.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MediaServiceImpl implements MediaService {

    private final S3Client s3Client;
    private final MediaRepository mediaRepository;

    @Value("${aws.s3.bucket-name:blogverse-media}")
    private String bucketName;

    @Value("${aws.s3.endpoint:http://localhost:9000}")
    private String s3Endpoint;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
            "video/mp4", "video/webm", "video/ogg"
    );

    @Override
    public MediaResponse uploadMedia(Long userId, MultipartFile file, Long postId) {
        String mimeType = file.getContentType();
        if (mimeType == null) {
            throw new IllegalArgumentException("File content type cannot be empty");
        }

        Media.MediaType mediaType;
        if (ALLOWED_IMAGE_TYPES.contains(mimeType.toLowerCase())) {
            mediaType = Media.MediaType.IMAGE;
        } else if (ALLOWED_VIDEO_TYPES.contains(mimeType.toLowerCase())) {
            mediaType = Media.MediaType.VIDEO;
        } else {
            throw new IllegalArgumentException("Unsupported file format: " + mimeType);
        }

        // Generate unique S3 key
        String extension = getExtension(file.getOriginalFilename());
        String s3Key = "uploads/" + userId + "/" + UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        String mediaUrl;
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(mimeType)
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            log.info("Uploaded file to S3/MinIO | key={}", s3Key);
            mediaUrl = s3Endpoint + "/" + bucketName + "/" + s3Key;
        } catch (Exception e) {
            log.warn("S3/MinIO unavailable, saving to local disk fallback: {}", e.getMessage());
            try {
                java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
                if (!java.nio.file.Files.exists(uploadDir)) {
                    java.nio.file.Files.createDirectories(uploadDir);
                }
                String fileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
                java.nio.file.Path filePath = uploadDir.resolve(fileName);
                java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                mediaUrl = "http://localhost:8085/uploads/" + fileName;
                s3Key = "local/" + fileName;
                log.info("Saved file locally at | path={}", filePath.toAbsolutePath());
            } catch (IOException ioErr) {
                log.error("Failed local file storage fallback: {}", ioErr.getMessage());
                throw new RuntimeException("Failed to store media file");
            }
        }

        Media media = Media.builder()
                .userId(userId)
                .postId(postId)
                .mediaType(mediaType)
                .s3Key(s3Key)
                .mediaUrl(mediaUrl)
                .originalFilename(file.getOriginalFilename())
                .fileSize(file.getSize())
                .mimeType(mimeType)
                .build();

        media = mediaRepository.save(media);
        log.info("Saved media metadata | id={}", media.getId());

        return mapToResponse(media);
    }

    @Override
    @Transactional(readOnly = true)
    public MediaResponse getMediaById(Long id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Media not found with ID: " + id));
        return mapToResponse(media);
    }

    @Override
    public void deleteMedia(Long id, Long userId, boolean isAdmin) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Media not found with ID: " + id));

        if (!isAdmin && !media.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own media");
        }

        try {
            s3Client.deleteObject(b -> b.bucket(bucketName).key(media.getS3Key()));
        } catch (Exception e) {
            log.warn("Failed to delete object from S3: {}", e.getMessage());
        }

        mediaRepository.delete(media);
        log.info("Deleted media record | id={}", id);
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private MediaResponse mapToResponse(Media media) {
        return MediaResponse.builder()
                .id(media.getId())
                .userId(media.getUserId())
                .postId(media.getPostId())
                .mediaType(media.getMediaType())
                .s3Key(media.getS3Key())
                .mediaUrl(media.getMediaUrl())
                .originalFilename(media.getOriginalFilename())
                .fileSize(media.getFileSize())
                .mimeType(media.getMimeType())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
