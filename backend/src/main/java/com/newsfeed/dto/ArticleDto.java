package com.newsfeed.dto;

import com.newsfeed.entity.Article;

import java.time.LocalDateTime;

public record ArticleDto(
        Long id,
        String title,
        String description,
        String imageUrl,
        String category,
        String source,
        LocalDateTime publishedAt,
        Long views
) {
    // Maps an entity to a DTO (never expose entities directly in responses)
    public static ArticleDto from(Article article) {
        return new ArticleDto(
                article.getId(),
                article.getTitle(),
                article.getDescription(),
                article.getImageUrl(),
                article.getCategory(),
                article.getSource(),
                article.getPublishedAt(),
                article.getViews()
        );
    }
}
