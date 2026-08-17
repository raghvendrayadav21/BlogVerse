package com.blogverse.app.repository;

import com.blogverse.app.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, Long> {
    Page<Post> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<Post> findByAuthorIdAndStatusOrderByCreatedAtDesc(Long authorId, String status, Pageable pageable);
    Page<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);
    Page<Post> findByTagsContainingAndStatusOrderByCreatedAtDesc(String tag, String status, Pageable pageable);
    Page<Post> findByStatusOrderByLikesCountDesc(String status, Pageable pageable);

    @Query("{'status': 'PUBLISHED', $or: [{'title': {$regex: ?0, $options: 'i'}}, {'content': {$regex: ?0, $options: 'i'}}]}")
    List<Post> searchPublished(String query);

    long countByAuthorIdAndStatus(Long authorId, String status);
    long countByStatus(String status);
}
