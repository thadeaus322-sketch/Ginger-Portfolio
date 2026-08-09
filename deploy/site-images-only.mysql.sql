-- Ginger Studios — minimal, non-destructive Harmon repair
--
-- Select the exact database used by the live app before importing this file.
-- This file touches ONLY the site_images table.
-- It never drops tables and never deletes or changes existing rows.
--
-- Use this when the website is working but the Site Images admin page reports
-- a query error for `site_images`.

CREATE TABLE IF NOT EXISTS `site_images` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `section`     VARCHAR(100) NOT NULL,
  `category`    VARCHAR(100) NOT NULL DEFAULT 'all',
  `title`       VARCHAR(1000) NOT NULL DEFAULT '',
  `label`       VARCHAR(255)  NOT NULL DEFAULT '',
  `image_url`   TEXT         NOT NULL,
  `sort_order`  INT          NOT NULL DEFAULT 0,
  `tall`        TINYINT(1)   NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `site_images_section_idx`      (`section`),
  KEY `site_images_section_sort_idx` (`section`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;