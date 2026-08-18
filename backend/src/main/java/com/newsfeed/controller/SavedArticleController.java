package com.newsfeed.controller;

import com.newsfeed.dto.ArticleDto;
import com.newsfeed.service.SavedArticleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// All endpoints require a valid JWT (handled by SecurityConfig)
@RestController
@RequestMapping("/saved")
public class SavedArticleController {

    private final SavedArticleService savedArticleService;

    public SavedArticleController(SavedArticleService savedArticleService) {
        this.savedArticleService = savedArticleService;
    }

    // GET /api/saved → the logged-in user's saved articles
    @GetMapping
    public List<ArticleDto> getSaved(Authentication authentication) {
        return savedArticleService.getSaved(authentication.getName());
    }

    // POST /api/saved/{articleId} → save an article
    @PostMapping("/{articleId}")
    public ResponseEntity<Void> save(@PathVariable Long articleId, Authentication authentication) {
        savedArticleService.save(authentication.getName(), articleId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // DELETE /api/saved/{articleId} → unsave an article
    @DeleteMapping("/{articleId}")
    public ResponseEntity<Void> unsave(@PathVariable Long articleId, Authentication authentication) {
        savedArticleService.unsave(authentication.getName(), articleId);
        return ResponseEntity.noContent().build();
    }
}
