package com.blogverse.user.repository;

import com.blogverse.user.entity.Follower;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowerRepository extends JpaRepository<Follower, Long> {

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Optional<Follower> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Page<Follower> findByFollowingId(Long followingId, Pageable pageable);

    Page<Follower> findByFollowerId(Long followerId, Pageable pageable);

    @Query("SELECT f.followingId FROM Follower f WHERE f.followerId = :followerId")
    List<Long> findFollowingIdsByFollowerId(@Param("followerId") Long followerId);

    long countByFollowingId(Long followingId);

    long countByFollowerId(Long followerId);
}
