package com.blogverse.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Application configuration beans for auth-service.
 */
@Configuration
public class AppConfig {

    /**
     * RestTemplate for inter-service REST calls.
     * Scoped to internal/trusted calls only.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
