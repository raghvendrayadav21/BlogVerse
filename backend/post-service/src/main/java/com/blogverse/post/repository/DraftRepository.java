package com.blogverse.post.repository;

import com.blogverse.post.entity.Draft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DraftRepository extends JpaRepository<Draft, Long> {
    List<Draft> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
