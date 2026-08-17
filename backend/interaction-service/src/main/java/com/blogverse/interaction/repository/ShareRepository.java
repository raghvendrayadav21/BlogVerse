package com.blogverse.interaction.repository;

import com.blogverse.interaction.entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShareRepository extends JpaRepository<Share, Long> {
    long countByPostId(Long postId);
}
