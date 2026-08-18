-- ============================================================
-- NewsFeed — Manual MySQL setup (optional)
-- ============================================================
-- The Spring Boot app normally creates the 'newsfeed' database
-- itself on first run (createDatabaseIfNotExist=true in
-- application.yml). This script is only needed if you prefer to
-- create it manually, or if auto-creation fails due to
-- permissions on your MySQL user.
--
-- Usage (from the backend/ folder):
--   mysql -u root -p < setup.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS newsfeed
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Verify it exists:
--   SHOW DATABASES;
-- (The 3 tables — users, articles, saved_articles — are created
--  automatically by Hibernate when the backend starts.)
