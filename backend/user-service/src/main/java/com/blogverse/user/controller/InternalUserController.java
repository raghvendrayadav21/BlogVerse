package com.blogverse.user.controller;

import com.blogverse.user.dto.request.CreateUserProfileRequest;
import com.blogverse.user.dto.response.ApiResponse;
import com.blogverse.user.dto.response.UserProfileResponse;
import com.blogverse.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
@Tag(name = "Internal User API", description = "Inter-service user creation and synchronization endpoints")
public class InternalUserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create or sync user profile from Auth Service")
    public ResponseEntity<ApiResponse<UserProfileResponse>> createOrSyncProfile(
            @Valid @RequestBody CreateUserProfileRequest request) {
        UserProfileResponse response = userService.createOrSyncProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("User profile synced successfully", response));
    }
}
