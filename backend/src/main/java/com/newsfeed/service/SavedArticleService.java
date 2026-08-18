package com.newsfeed.service;

import com.newsfeed.dto.ArticleDto;
import com.newsfeed.entity.Article;
import com.newsfeed.entity.SavedArticle;
import com.newsfeed.entity.User;
import com.newsfeed.exception.ResourceNotFoundException;
import com.newsfeed.repository.ArticleRepository;
import com.newsfeed.repository.SavedArticleRepository;
import com.newsfeed.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SavedArticleService {

    private final SavedArticleRepository savedArticleRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public SavedArticleService(SavedArticleRepository savedArticleRepository,
                               ArticleRepository articleRepository,
                               UserRepository userRepository) {
        this.savedArticleRepository = savedArticleRepository;
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
    }

    public List<ArticleDto> getSaved(String email) {
        User user = userByEmail(email);
        return savedArticleRepository.findByUserIdOrderBySavedAtDesc(user.getId())
                .stream()
                .map(saved -> ArticleDto.from(saved.getArticle()))
                .toList();
    }

    @Transactional
    public void save(String email, Long articleId) {
        User user = userByEmail(email);
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + articleId));

        // Idempotent — saving twice does nothing
        if (!savedArticleRepository.existsByUserIdAndArticleId(user.getId(), articleId)) {
            SavedArticle saved = new SavedArticle();
            saved.setUser(user);
            saved.setArticle(article);
            savedArticleRepository.save(saved);
        }
    }

    @Transactional
    public void unsave(String email, Long articleId) {
        User user = userByEmail(email);
        savedArticleRepository.findByUserIdAndArticleId(user.getId(), articleId)
                .ifPresent(savedArticleRepository::delete);
    }

    private User userByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
