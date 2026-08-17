package com.blogverse.app.repository;

import com.blogverse.app.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface LikeRepository extends MongoRepository<Like, String> {
    boolean existsByUserIdAndPostId(Long userId, Long postId);
    Optional<Like> findByUserIdAndPostId(Long userId, Long postId);
    List<Like> findByUserId(Long userId);
    long countByPostId(Long postId);
}
