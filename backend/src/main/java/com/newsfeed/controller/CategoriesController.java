package com.newsfeed.controller;

import com.newsfeed.service.ArticleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoriesController {

    private final ArticleService articleService;

    public CategoriesController(ArticleService articleService) {
        this.articleService = articleService;
    }

    // GET /api/categories → distinct categories from the articles table
    @GetMapping
    public List<String> getCategories() {
        return articleService.getCategories();
    }
}
