package com.blogverse.app.controller;

import com.blogverse.app.exception.ApiResponse;
import com.blogverse.app.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> globalSearch(@RequestParam(name = "q") String q) {
        return ResponseEntity.ok(ApiResponse.success("Search results", searchService.globalSearch(q)));
    }
}
