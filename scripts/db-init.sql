-- ============================================================
-- BlogVerse Unified Database Initialization Script
-- ============================================================

-- Cleanup previous databases if they exist
DROP DATABASE IF EXISTS blogverse_auth;
DROP DATABASE IF EXISTS blogverse_users;
DROP DATABASE IF EXISTS blogverse_posts;
DROP DATABASE IF EXISTS blogverse_interactions;
DROP DATABASE IF EXISTS blogverse_media;
DROP DATABASE IF EXISTS blogverse_notifications;
DROP DATABASE IF EXISTS blogverse_search;

-- Create single unified database "blogverse"
CREATE DATABASE IF NOT EXISTS blogverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE blogverse;
