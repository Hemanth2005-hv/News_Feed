package com.newsfeed.controller;

import com.newsfeed.dto.ArticleDto;
import com.newsfeed.service.ArticleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    // GET /api/articles            → all articles (newest first)
    // GET /api/articles?category=X → filtered by category
    // GET /api/articles?q=text     → search by title/description/category/source
    @GetMapping
    public List<ArticleDto> getAll(@RequestParam(required = false) String category,
                                   @RequestParam(required = false) String q) {
        return articleService.getAll(category, q);
    }

    // GET /api/articles/trending → most-viewed articles
    @GetMapping("/trending")
    public List<ArticleDto> getTrending() {
        return articleService.getTrending();
    }

    // GET /api/articles/{id} → one article
    @GetMapping("/{id}")
    public ArticleDto getById(@PathVariable Long id) {
        return articleService.getById(id);
    }
}
