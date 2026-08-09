-- Ginger Studios — non-destructive MySQL schema initializer
--
-- IMPORTANT:
-- 1. Select the exact database referenced by the server's DATABASE_URL before running this file.
-- 2. This file never drops tables and never deletes or overwrites existing rows.
-- 3. It creates only tables that are missing. Existing tables are left unchanged.
--
-- Use deploy/admin-recovery.mysql.sql separately only if the admin account itself
-- must be reset.

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` TEXT         NOT NULL,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_users_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `galleries` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `client_name`   TEXT         NOT NULL,
  `shoot_title`   TEXT         NOT NULL,
  `image_urls`    JSON         NOT NULL,
  `cover_url`     TEXT         DEFAULT NULL,
  `notes`         TEXT         DEFAULT NULL,
  `access_token`  VARCHAR(500) NOT NULL,
  `view_count`    INT          NOT NULL DEFAULT 0,
  `is_revoked`    TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at`    DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `galleries_access_token_idx` (`access_token`(255)),
  KEY `galleries_expires_at_idx` (`expires_at`),
  KEY `galleries_is_revoked_idx` (`is_revoked`),
  KEY `galleries_status_composite_idx` (`is_revoked`, `expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `site_images` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `section`     VARCHAR(100) NOT NULL,
  `category`    VARCHAR(100) NOT NULL DEFAULT 'all',
  -- VARCHAR keeps this compatible with older MySQL/MariaDB versions.
  `title`       VARCHAR(1000) NOT NULL DEFAULT '',
  `label`       VARCHAR(255)  NOT NULL DEFAULT '',
  `image_url`   TEXT         NOT NULL,
  `sort_order`  INT          NOT NULL DEFAULT 0,
  `tall`        TINYINT(1)   NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `site_images_section_idx` (`section`),
  KEY `site_images_section_sort_idx` (`section`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;