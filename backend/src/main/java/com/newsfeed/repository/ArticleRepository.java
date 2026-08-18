package com.newsfeed.repository;

import com.newsfeed.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    List<Article> findAllByOrderByPublishedAtDesc();

    List<Article> findAllByOrderByViewsDesc();

    List<Article> findByCategoryIgnoreCase(String category);

    // Simple search across title, description, category and source
    List<Article> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrSourceContainingIgnoreCase(
            String title, String description, String category, String source);

    @Query("SELECT DISTINCT a.category FROM Article a ORDER BY a.category")
    List<String> findDistinctCategories();
}
