package com.blogverse.user.repository;

import com.blogverse.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    @Modifying
    @Query("UPDATE User u SET u.followersCount = u.followersCount + :delta WHERE u.id = :userId")
    void updateFollowersCount(@Param("userId") Long userId, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE User u SET u.followingCount = u.followingCount + :delta WHERE u.id = :userId")
    void updateFollowingCount(@Param("userId") Long userId, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE User u SET u.postsCount = u.postsCount + :delta WHERE u.id = :userId")
    void updatePostsCount(@Param("userId") Long userId, @Param("delta") int delta);

    @Query("SELECT u FROM User u WHERE u.id != :userId ORDER BY u.followersCount DESC")
    List<User> findSuggestedUsers(@Param("userId") Long userId);
}
