package com.blogverse.post.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hashtags", indexes = {
        @Index(name = "idx_hashtag_name", columnList = "name", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "post_count", nullable = false)
    @Builder.Default
    private long postCount = 1;
}
