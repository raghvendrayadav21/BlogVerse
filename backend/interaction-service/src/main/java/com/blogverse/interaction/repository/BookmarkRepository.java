package com.blogverse.interaction.repository;

import com.blogverse.interaction.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    boolean existsByUserIdAndPostId(Long userId, Long postId);
    Optional<Bookmark> findByUserIdAndPostId(Long userId, Long postId);
    Page<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Bookmark> findByUserIdAndCollectionNameOrderByCreatedAtDesc(Long userId, String collectionName, Pageable pageable);
}
