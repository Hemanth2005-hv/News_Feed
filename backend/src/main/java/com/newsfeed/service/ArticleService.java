package com.newsfeed.service;

import com.newsfeed.dto.ArticleDto;
import com.newsfeed.entity.Article;
import com.newsfeed.exception.ResourceNotFoundException;
import com.newsfeed.repository.ArticleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    // Optional ?category= and ?q= (search) query params
    public List<ArticleDto> getAll(String category, String q) {
        List<Article> articles;

        if (category != null && !category.isBlank()) {
            articles = articleRepository.findByCategoryIgnoreCase(category);
        } else if (q != null && !q.isBlank()) {
            articles = articleRepository
                    .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrSourceContainingIgnoreCase(
                            q, q, q, q);
        } else {
            articles = articleRepository.findAllByOrderByPublishedAtDesc();
        }

        return articles.stream().map(ArticleDto::from).toList();
    }

    public ArticleDto getById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
        return ArticleDto.from(article);
    }

    public List<ArticleDto> getTrending() {
        return articleRepository.findAllByOrderByViewsDesc().stream()
                .limit(10)
                .map(ArticleDto::from)
                .toList();
    }

    public List<String> getCategories() {
        return articleRepository.findDistinctCategories();
    }
}
