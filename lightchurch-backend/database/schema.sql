-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: light_church
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_types`
--

DROP TABLE IF EXISTS `activity_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label_fr` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('SUPER_ADMIN','PASTOR','EVANGELIST') COLLATE utf8mb4_unicode_ci DEFAULT 'PASTOR',
  `status` enum('PENDING','VALIDATED','REJECTED','SUSPENDED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_sirene_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `allow_network_visibility` tinyint(1) DEFAULT '1' COMMENT 'Permet au pasteur d apparaître dans le réseau pastoral',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `idx_admins_status` (`status`),
  KEY `idx_admins_role` (`role`),
  KEY `idx_admins_status_created` (`status`,`created_at`),
  KEY `idx_admins_status_role` (`status`,`role`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `church_details`
--

DROP TABLE IF EXISTS `church_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_details` (
  `church_id` int NOT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `language_id` int NOT NULL DEFAULT '10',
  `pastor_first_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pastor_last_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `street_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_parking` tinyint(1) DEFAULT '0',
  `parking_capacity` int DEFAULT NULL,
  `is_parking_free` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`church_id`),
  KEY `fk_det_lang` (`language_id`),
  KEY `idx_city` (`city`),
  KEY `idx_postal_code` (`postal_code`),
  KEY `idx_church_details_status` (`status`),
  FULLTEXT KEY `idx_church_desc_search` (`description`),
  CONSTRAINT `fk_det_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_det_lang` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `church_schedules`
--

DROP TABLE IF EXISTS `church_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `activity_type_id` int NOT NULL,
  `day_of_week` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sch_church` (`church_id`),
  KEY `fk_sch_type` (`activity_type_id`),
  CONSTRAINT `fk_sch_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sch_type` FOREIGN KEY (`activity_type_id`) REFERENCES `activity_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `church_socials`
--

DROP TABLE IF EXISTS `church_socials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_socials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `platform` enum('FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK','WHATSAPP','LINKEDIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_social_church` (`church_id`),
  CONSTRAINT `fk_social_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `church_unions`
--

DROP TABLE IF EXISTS `church_unions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_unions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `churches`
--

DROP TABLE IF EXISTS `churches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `churches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `denomination_id` int NOT NULL,
  `church_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` point NOT NULL,
  `latitude` decimal(10,7) GENERATED ALWAYS AS (st_y(`location`)) VIRTUAL,
  `longitude` decimal(10,7) GENERATED ALWAYS AS (st_x(`location`)) VIRTUAL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  SPATIAL KEY `idx_church_geo` (`location`),
  KEY `fk_ch_admin` (`admin_id`),
  KEY `fk_ch_den` (`denomination_id`),
  FULLTEXT KEY `idx_church_name_search` (`church_name`),
  CONSTRAINT `fk_ch_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `fk_ch_den` FOREIGN KEY (`denomination_id`) REFERENCES `denominations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `denominations`
--

DROP TABLE IF EXISTS `denominations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denominations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `union_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_den_union` (`union_id`),
  CONSTRAINT `fk_den_union` FOREIGN KEY (`union_id`) REFERENCES `church_unions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_details`
--

DROP TABLE IF EXISTS `event_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_details` (
  `event_id` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `max_seats` int DEFAULT NULL,
  `image_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `street_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `speaker_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_parking` tinyint(1) DEFAULT '0',
  `parking_capacity` int DEFAULT NULL,
  `is_parking_free` tinyint(1) DEFAULT '1',
  `parking_details` text COLLATE utf8mb4_unicode_ci,
  `is_free` tinyint(1) DEFAULT '1',
  `registration_link` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtube_live` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `idx_event_city` (`city`),
  KEY `idx_event_postal_code` (`postal_code`),
  CONSTRAINT `fk_det_event_final` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_interests`
--

DROP TABLE IF EXISTS `event_interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_interests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event_device` (`event_id`,`device_id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_interest_device` FOREIGN KEY (`device_id`) REFERENCES `push_tokens` (`device_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_interest_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_translations`
--

DROP TABLE IF EXISTS `event_translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_translations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `language_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event_language` (`event_id`,`language_id`),
  KEY `fk_event_trans_lang` (`language_id`),
  KEY `idx_event_translations_event_id` (`event_id`),
  CONSTRAINT `fk_event_trans_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_event_trans_lang` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `church_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `language_id` int NOT NULL DEFAULT '10',
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `event_location` point NOT NULL,
  `latitude` decimal(10,7) GENERATED ALWAYS AS (st_y(`event_location`)) VIRTUAL,
  `longitude` decimal(10,7) GENERATED ALWAYS AS (st_x(`event_location`)) VIRTUAL,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `interested_count` int DEFAULT '0' COMMENT 'Nombre de personnes intÃ©ressÃ©es',
  PRIMARY KEY (`id`),
  SPATIAL KEY `idx_evt_geo` (`event_location`),
  KEY `fk_evt_admin` (`admin_id`),
  KEY `fk_evt_lang_id` (`language_id`),
  KEY `idx_events_church_id` (`church_id`),
  KEY `idx_events_start_datetime` (`start_datetime`),
  KEY `idx_events_status_date` (`start_datetime`),
  KEY `fk_events_cancelled_by` (`cancelled_by`),
  KEY `idx_events_created_at` (`created_at` DESC),
  KEY `idx_events_updated_at` (`updated_at` DESC),
  KEY `idx_interested_count` (`interested_count`),
  FULLTEXT KEY `idx_evt_title_search` (`title`),
  CONSTRAINT `fk_events_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_evt_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `fk_evt_lang_id` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `languages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_native` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_fr` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flag_emoji` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_UNIQUE` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `push_tokens`
--

DROP TABLE IF EXISTS `push_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `push_token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` enum('ios','android') COLLATE utf8mb4_unicode_ci NOT NULL,
  `language_id` int DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_device` (`device_id`),
  KEY `fk_token_lang_id` (`language_id`),
  CONSTRAINT `fk_token_lang_id` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'light_church'
--

--
-- Dumping routines for database 'light_church'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-08 10:07:03
