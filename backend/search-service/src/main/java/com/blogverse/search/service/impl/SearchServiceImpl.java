package com.blogverse.search.service.impl;

import com.blogverse.search.dto.response.SearchResultResponse;
import com.blogverse.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private static final List<String> TRENDING_TAGS = Arrays.asList(
            "SpringBoot", "React", "Java", "AWS", "Microservices", "TypeScript", "TailwindCSS"
    );

    @Override
    public SearchResultResponse search(String query) {
        String cleanQuery = query != null ? query.trim().toLowerCase() : "";
        List<String> matchedTags = TRENDING_TAGS.stream()
                .filter(t -> t.toLowerCase().contains(cleanQuery))
                .collect(Collectors.toList());

        return SearchResultResponse.builder()
                .query(query)
                .hashtags(matchedTags)
                .build();
    }
}
