package com.blogverse.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {

    private Long userId;
    private String username;
    private String profileImageUrl;
    private String bio;
    private Boolean isFollowing;
}
