package com.blogverse.app.repository;

import com.blogverse.app.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, Long> {
    Page<Post> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<Post> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status, Pageable pageable);
    Page<Post> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Post> findByHashtagsContainingAndStatusOrderByCreatedAtDesc(String tag, String status, Pageable pageable);
    Page<Post> findByStatusOrderByLikesCountDesc(String status, Pageable pageable);

    @Query("{'status': 'PUBLISHED', $or: [{'title': {$regex: ?0, $options: 'i'}}, {'content': {$regex: ?0, $options: 'i'}}]}")
    List<Post> searchPublished(String query);

    long countByUserIdAndStatus(Long userId, String status);
    long countByStatus(String status);
}
