package com.blogverse.app.repository;

import com.blogverse.app.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    @Query("{'username': {$regex: ?0, $options: 'i'}}")
    java.util.List<User> findByUsernameContainingIgnoreCase(String username);
}
