package com.blogverse.search.controller;

import com.blogverse.search.dto.response.ApiResponse;
import com.blogverse.search.dto.response.SearchResultResponse;
import com.blogverse.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Global search across users, posts, and hashtags")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Unified search query")
    public ResponseEntity<ApiResponse<SearchResultResponse>> search(@RequestParam String q) {
        SearchResultResponse result = searchService.search(q);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
