package com.blogverse.user.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    @Size(max = 255, message = "Website URL cannot exceed 255 characters")
    private String website;

    @Size(max = 1024, message = "Profile image URL cannot exceed 1024 characters")
    private String profileImageUrl;
}
