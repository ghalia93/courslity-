-- --------------------------------------------------------
-- Coursality Database Schema
-- --------------------------------------------------------
SET SQL_MODE = "STRICT_TRANS_TABLES,NO_AUTO_VALUE_ON_ZERO,NO_ENGINE_SUBSTITUTION";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS coursality;
USE coursality;

-- --------------------------------------------------------
-- Table: university
-- --------------------------------------------------------
CREATE TABLE `university` (
  `university_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email_domain` VARCHAR(100) NOT NULL DEFAULT '',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`university_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: department
-- --------------------------------------------------------
CREATE TABLE `department` (
  `department_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `university_id` INT UNSIGNED NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`department_id`),
  KEY `idx_department_university` (`university_id`),
  CONSTRAINT `fk_department_university`
    FOREIGN KEY (`university_id`) REFERENCES `university`(`university_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: major
-- --------------------------------------------------------
CREATE TABLE `major` (
  `major_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `department_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`major_id`),
  UNIQUE KEY `uniq_major_department_name` (`department_id`, `name`),
  KEY `idx_major_department` (`department_id`),
  CONSTRAINT `fk_major_department`
    FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: user
-- --------------------------------------------------------
CREATE TABLE `user` (
  `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student','admin','super_admin') NOT NULL DEFAULT 'student',
  `university_id` INT UNSIGNED DEFAULT NULL,
  -- Email verification: token is set on registration, cleared on verification
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `email_verification_token` VARCHAR(255) NULL DEFAULT NULL,
  -- Password reset support
  `password_reset_token` VARCHAR(255) NULL DEFAULT NULL,
  `password_reset_expires_at` TIMESTAMP NULL DEFAULT NULL,
  -- Soft delete
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uniq_user_email` (`email`),
  KEY `idx_user_university` (`university_id`),
  KEY `idx_user_email_verified` (`email_verified_at`),
  CONSTRAINT `fk_user_university`
    FOREIGN KEY (`university_id`) REFERENCES `university`(`university_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: course
-- --------------------------------------------------------
CREATE TABLE `course` (
  `course_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `credits` TINYINT UNSIGNED NOT NULL,   -- credits realistically 1-9; TINYINT saves space and rejects negatives
  `language` ENUM('English','Arabic','French','German','Spanish','Other') NOT NULL DEFAULT 'English',
  `level` ENUM('freshman','undergraduate','graduate','master_degree','doctoral') NOT NULL,
  `department_id` INT UNSIGNED NOT NULL,
  -- Soft delete: preserves reviews when a course is retired
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `uniq_course_code_department` (`code`, `department_id`),
  KEY `idx_course_department` (`department_id`),
  KEY `idx_course_level` (`level`),
  CONSTRAINT `fk_course_department`
    FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: course_prerequisite
-- --------------------------------------------------------
CREATE TABLE `course_prerequisite` (
  `course_id` INT UNSIGNED NOT NULL,
  `prereq_course_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`course_id`, `prereq_course_id`),
  KEY `idx_prereq_course` (`prereq_course_id`),
  CONSTRAINT `fk_prereq_course`
    FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prereq_prereq_course`
    FOREIGN KEY (`prereq_course_id`) REFERENCES `course`(`course_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: roadmap
-- --------------------------------------------------------
CREATE TABLE `roadmap` (
  `roadmap_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `major_id` INT UNSIGNED NOT NULL,
  `level` ENUM('freshman','undergraduate','graduate','master_degree','doctoral') NOT NULL,
  `title` VARCHAR(255) NOT NULL DEFAULT '',
  `total_credits` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`roadmap_id`),
  UNIQUE KEY `uniq_roadmap_major_level` (`major_id`, `level`),
  KEY `idx_roadmap_level` (`level`),
  KEY `idx_roadmap_created_by` (`created_by`),
  CONSTRAINT `fk_roadmap_major`
    FOREIGN KEY (`major_id`) REFERENCES `major`(`major_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_roadmap_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `user`(`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: roadmap_course
-- --------------------------------------------------------
CREATE TABLE `roadmap_course` (
  `roadmap_course_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `roadmap_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `year_number` TINYINT UNSIGNED NOT NULL,
  `semester` ENUM('fall','spring','summer') NOT NULL,
  `sequence_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`roadmap_course_id`),
  UNIQUE KEY `uniq_roadmap_course` (`roadmap_id`, `course_id`),
  KEY `idx_roadmap_course_term` (`roadmap_id`, `year_number`, `semester`, `sequence_order`),
  KEY `idx_roadmap_course_course` (`course_id`),
  CONSTRAINT `fk_roadmap_course_roadmap`
    FOREIGN KEY (`roadmap_id`) REFERENCES `roadmap`(`roadmap_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_roadmap_course_course`
    FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: review
-- --------------------------------------------------------
CREATE TABLE `review` (
  `review_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `semester_taken` VARCHAR(50) NOT NULL,
  `review_text` TEXT NOT NULL,
  `instructor_name` VARCHAR(255) NOT NULL,
  -- All ratings use DECIMAL(3,2) consistently, range 0.00–5.00
  `overall_rating` DECIMAL(3,2) NOT NULL CHECK (`overall_rating` BETWEEN 0 AND 5),
  `grading_rating` DECIMAL(3,2) NOT NULL CHECK (`grading_rating` BETWEEN 0 AND 5),
  `workload_rating` DECIMAL(3,2) NOT NULL CHECK (`workload_rating` BETWEEN 0 AND 5),
  `attendance_rating` DECIMAL(3,2) NOT NULL CHECK (`attendance_rating` BETWEEN 0 AND 5),
  `exam_difficulty_rating` DECIMAL(3,2) NOT NULL CHECK (`exam_difficulty_rating` BETWEEN 0 AND 5),
  -- Soft delete: allows moderation without destroying vote history
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `hidden_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  -- One review per user per course
  UNIQUE KEY `uniq_review_user_course` (`user_id`, `course_id`),
  KEY `idx_review_user` (`user_id`),
  KEY `idx_review_course` (`course_id`),
  CONSTRAINT `fk_review_user`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_review_course`
    FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: review_vote
-- --------------------------------------------------------
CREATE TABLE `review_vote` (
  `review_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `vote_value` TINYINT NOT NULL CHECK (`vote_value` IN (-1, 1)),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`, `user_id`),
  KEY `idx_vote_user` (`user_id`),
  CONSTRAINT `fk_vote_review`
    FOREIGN KEY (`review_id`) REFERENCES `review`(`review_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vote_user`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: feedback
-- --------------------------------------------------------
CREATE TABLE `feedback` (
  `feedback_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `kind` ENUM('feedback','problem') NOT NULL DEFAULT 'feedback',
  `rating` DECIMAL(3,2) NOT NULL CHECK (`rating` BETWEEN 0 AND 5),
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hidden_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`feedback_id`),
  KEY `idx_feedback_user` (`user_id`),
  CONSTRAINT `fk_feedback_user`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
    ON DELETE SET NULL     
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `password_reset_token` (
  `user_id`    INT UNSIGNED NOT NULL,
  `token`      TEXT         NOT NULL,          -- The raw JWT (can exceed 255 chars)
  `expires_at` DATETIME     NOT NULL,
  `used_at`    DATETIME     DEFAULT NULL,       -- Set when consumed; NULL = still valid
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`user_id`),                      -- One pending reset per user at a time
  CONSTRAINT `fk_prt_user`
    FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: notification
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notification` (
  `notification_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(255) NULL DEFAULT NULL,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_notification_user_read` (`user_id`, `read_at`, `created_at`),
  CONSTRAINT `fk_notification_user`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tables: support chat
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `support_thread` (
  `thread_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `visitor_key` VARCHAR(64) NULL,
  `visitor_name` VARCHAR(120) NULL,
  `status` ENUM('open','closed') NOT NULL DEFAULT 'open',
  `last_message_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`thread_id`),
  UNIQUE KEY `uniq_support_thread_user` (`user_id`),
  UNIQUE KEY `uniq_support_thread_visitor` (`visitor_key`),
  KEY `idx_support_thread_last_message` (`last_message_at`),
  CONSTRAINT `fk_support_thread_user`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `support_message` (
  `message_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thread_id` INT UNSIGNED NOT NULL,
  `sender_id` INT UNSIGNED NULL,
  `sender_role` ENUM('student','visitor','admin') NOT NULL,
  `body` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `idx_support_message_thread` (`thread_id`, `created_at`),
  KEY `idx_support_message_sender` (`sender_id`),
  CONSTRAINT `fk_support_message_thread`
    FOREIGN KEY (`thread_id`) REFERENCES `support_thread`(`thread_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_support_message_sender`
    FOREIGN KEY (`sender_id`) REFERENCES `user`(`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



COMMIT;
