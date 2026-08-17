package com.blogverse.unified;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.blogverse")
@EntityScan(basePackages = "com.blogverse")
@EnableJpaRepositories(basePackages = "com.blogverse")
public class BlogVerseUnifiedApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlogVerseUnifiedApplication.class, args);
    }
}
