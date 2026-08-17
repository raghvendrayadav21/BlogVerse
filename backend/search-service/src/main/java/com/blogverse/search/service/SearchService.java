package com.blogverse.search.service;

import com.blogverse.search.dto.response.SearchResultResponse;

public interface SearchService {
    SearchResultResponse search(String query);
}
