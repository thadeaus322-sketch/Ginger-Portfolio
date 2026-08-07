-- ============================================================
-- Ginger Studios & Creatives — MySQL Database Schema
-- Import this file via phpMyAdmin: Database → Import → Choose File
-- ============================================================

-- Create and select the database (replace 'ginger_studios' with your DB name)
-- CREATE DATABASE IF NOT EXISTS `ginger_studios` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `ginger_studios`;

SET FOREIGN_KEY_CHECKS = 0;

-- ─── admin_users ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` TEXT         NOT NULL,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_users_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── galleries ───────────────────────────────────────────────────────────────
-- image_urls stores a JSON array of URL strings, e.g. ["https://...", "https://..."]
DROP TABLE IF EXISTS `galleries`;
CREATE TABLE `galleries` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `client_name`   TEXT         NOT NULL,
  `shoot_title`   TEXT         NOT NULL,
  `image_urls`    JSON         NOT NULL DEFAULT (JSON_ARRAY()),
  `cover_url`     TEXT         DEFAULT NULL,
  `notes`         TEXT         DEFAULT NULL,
  `access_token`  VARCHAR(500) NOT NULL,
  `view_count`    INT          NOT NULL DEFAULT 0,
  `is_revoked`    TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at`    DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `galleries_access_token_idx` (`access_token`(255)),
  KEY `galleries_expires_at_idx`       (`expires_at`),
  KEY `galleries_is_revoked_idx`       (`is_revoked`),
  KEY `galleries_status_composite_idx` (`is_revoked`, `expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── site_images ─────────────────────────────────────────────────────────────
-- section: "hero_slide" | "card_stack" | "portfolio"
-- category: "weddings" | "portraits" | "events" | "food" | "products" | "birthday" | "all"
DROP TABLE IF EXISTS `site_images`;
CREATE TABLE `site_images` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `section`     VARCHAR(100) NOT NULL,
  `category`    VARCHAR(100) NOT NULL DEFAULT 'all',
  `title`       TEXT         NOT NULL DEFAULT '',
  `label`       TEXT         NOT NULL DEFAULT '',
  `image_url`   TEXT         NOT NULL,
  `sort_order`  INT          NOT NULL DEFAULT 0,
  `tall`        TINYINT(1)   NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `site_images_section_idx`      (`section`),
  KEY `site_images_section_sort_idx` (`section`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Seed a default admin user
-- Password below is SHA256 of "GingerStudios2026!"
-- Change this immediately after first login via Admin → Settings
-- ============================================================
INSERT INTO `admin_users` (`email`, `password_hash`) VALUES
('admin@gingerstudios.com', 'f332fe25fa2eecfc3e58d7fa337f918b5d3fabe9ec9379a5149f17d9e74c3174');
