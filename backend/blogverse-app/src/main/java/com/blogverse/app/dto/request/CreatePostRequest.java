package com.blogverse.app.dto.request;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreatePostRequest {
    private String title;
    private String content;
    private String excerpt;
    private String coverImageUrl;
    private String status = "PUBLISHED"; // PUBLISHED or DRAFT
    private List<String> tags;
}
