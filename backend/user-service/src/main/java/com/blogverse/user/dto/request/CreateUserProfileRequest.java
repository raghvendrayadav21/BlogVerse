package com.blogverse.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserProfileRequest {

    @NotNull
    private Long id;

    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    private String profileImageUrl;
    private String bio;
}
