-- Ginger Studios — safe admin login recovery for MySQL
-- This file only changes the admin_users table.
-- It does not touch galleries, site_images, or uploaded files.
--
-- Default login after running:
--   Email: admin@gingerstudios.com
--   Password: GingerStudios2026!
--
-- Change these credentials immediately after logging in.

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` TEXT         NOT NULL,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_users_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `admin_users`;

INSERT INTO `admin_users` (`email`, `password_hash`) VALUES
('admin@gingerstudios.com', 'f332fe25fa2eecfc3e58d7fa337f918b5d3fabe9ec9379a5149f17d9e74c3174');