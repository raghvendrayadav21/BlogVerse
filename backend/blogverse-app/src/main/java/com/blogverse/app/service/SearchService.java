package com.blogverse.app.service;

import com.blogverse.app.model.Post;
import com.blogverse.app.model.User;
import com.blogverse.app.repository.PostRepository;
import com.blogverse.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public Map<String, Object> globalSearch(String query) {
        List<Post> posts = postRepository.searchPublished(query);
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(query);
        return Map.of("posts", posts, "users", users, "hashtags", List.of());
    }
}
