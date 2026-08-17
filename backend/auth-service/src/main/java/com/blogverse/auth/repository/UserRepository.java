package com.blogverse.auth.repository;

import com.blogverse.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.provider = com.blogverse.auth.entity.User$AuthProvider.GOOGLE")
    Optional<User> findByEmailAndGoogleProvider(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.providerId = :providerId AND u.provider = com.blogverse.auth.entity.User$AuthProvider.GOOGLE")
    Optional<User> findByGoogleProviderId(@Param("providerId") String providerId);
}
