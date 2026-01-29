-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Jan 29, 2026 at 05:34 AM
-- Server version: 8.4.7
-- PHP Version: 8.3.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ppes`
--

-- --------------------------------------------------------

--
-- Table structure for table `committee_evaluations`
--

CREATE TABLE `committee_evaluations` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `committee_user_id` int NOT NULL,
  `indicator_id` int NOT NULL,
  `score` tinyint DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `evaluated_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `committee_summary`
--

CREATE TABLE `committee_summary` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `committee_user_id` int NOT NULL,
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `signature_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluatees`
--

CREATE TABLE `evaluatees` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `position_id` int NOT NULL,
  `department_id` int NOT NULL,
  `period_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_committee`
--

CREATE TABLE `evaluation_committee` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `committee_user_id` int NOT NULL,
  `role` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_periods`
--

CREATE TABLE `evaluation_periods` (
  `id` int NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Pending','Start','Finish') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_results`
--

CREATE TABLE `evaluation_results` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `total_score` decimal(6,2) DEFAULT NULL,
  `average_score` decimal(6,2) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_scale`
--

CREATE TABLE `evaluation_scale` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `value` tinyint NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_status`
--

CREATE TABLE `evaluation_status` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `committee_user_id` int NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_topics`
--

CREATE TABLE `evaluation_topics` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evidences`
--

CREATE TABLE `evidences` (
  `id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `indicator_id` int NOT NULL,
  `file_path` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `indicators`
--

CREATE TABLE `indicators` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `topic_id` int NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `weight` decimal(5,2) NOT NULL,
  `required_evidence` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `indicator_references`
--

CREATE TABLE `indicator_references` (
  `id` int NOT NULL,
  `indicator_id` int NOT NULL,
  `ref_type` enum('file','url') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'file',
  `ref_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ref_path` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `self_evaluations`
--

CREATE TABLE `self_evaluations` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `indicator_id` int NOT NULL,
  `score` tinyint DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `prefix` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('Personnel','Evaluatees','Evaluator') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `committee_evaluations`
--
ALTER TABLE `committee_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `period_id` (`period_id`,`evaluatee_id`,`committee_user_id`,`indicator_id`),
  ADD KEY `evaluatee_id` (`evaluatee_id`),
  ADD KEY `committee_user_id` (`committee_user_id`),
  ADD KEY `indicator_id` (`indicator_id`);

--
-- Indexes for table `committee_summary`
--
ALTER TABLE `committee_summary`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `period_id` (`period_id`,`evaluatee_id`,`committee_user_id`),
  ADD KEY `evaluatee_id` (`evaluatee_id`),
  ADD KEY `committee_user_id` (`committee_user_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `evaluatees`
--
ALTER TABLE `evaluatees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `position_id` (`position_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `period_id` (`period_id`);

--
-- Indexes for table `evaluation_committee`
--
ALTER TABLE `evaluation_committee`
  ADD PRIMARY KEY (`id`),
  ADD KEY `period_id` (`period_id`),
  ADD KEY `evaluatee_id` (`evaluatee_id`),
  ADD KEY `committee_user_id` (`committee_user_id`);

--
-- Indexes for table `evaluation_periods`
--
ALTER TABLE `evaluation_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `evaluation_results`
--
ALTER TABLE `evaluation_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `period_id` (`period_id`,`evaluatee_id`),
  ADD KEY `evaluatee_id` (`evaluatee_id`);

--
-- Indexes for table `evaluation_scale`
--
ALTER TABLE `evaluation_scale`
  ADD PRIMARY KEY (`id`),
  ADD KEY `period_id` (`period_id`);

--
-- Indexes for table `evaluation_status`
--
ALTER TABLE `evaluation_status`
  ADD PRIMARY KEY (`id`),
  ADD KEY `period_id` (`period_id`),
  ADD KEY `evaluatee_id` (`evaluatee_id`),
  ADD KEY `committee_user_id` (`committee_user_id`);

--
-- Indexes for table `evaluation_topics`
--
ALTER TABLE `evaluation_topics`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `evidences`
--
ALTER TABLE `evidences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `evaluatee_id` (`evaluatee_id`),
  ADD KEY `indicator_id` (`indicator_id`);

--
-- Indexes for table `indicators`
--
ALTER TABLE `indicators`
  ADD PRIMARY KEY (`id`),
  ADD KEY `period_id` (`period_id`),
  ADD KEY `topic_id` (`topic_id`);

--
-- Indexes for table `indicator_references`
--
ALTER TABLE `indicator_references`
  ADD PRIMARY KEY (`id`),
  ADD KEY `indicator_id` (`indicator_id`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `self_evaluations`
--
ALTER TABLE `self_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `period_id` (`period_id`,`evaluatee_id`,`indicator_id`),
  ADD KEY `evaluatee_id` (`evaluatee_id`),
  ADD KEY `indicator_id` (`indicator_id`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `committee_evaluations`
--
ALTER TABLE `committee_evaluations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `committee_summary`
--
ALTER TABLE `committee_summary`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluatees`
--
ALTER TABLE `evaluatees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_committee`
--
ALTER TABLE `evaluation_committee`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_periods`
--
ALTER TABLE `evaluation_periods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_results`
--
ALTER TABLE `evaluation_results`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_scale`
--
ALTER TABLE `evaluation_scale`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_status`
--
ALTER TABLE `evaluation_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_topics`
--
ALTER TABLE `evaluation_topics`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evidences`
--
ALTER TABLE `evidences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `indicators`
--
ALTER TABLE `indicators`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `indicator_references`
--
ALTER TABLE `indicator_references`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `self_evaluations`
--
ALTER TABLE `self_evaluations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `committee_evaluations`
--
ALTER TABLE `committee_evaluations`
  ADD CONSTRAINT `committee_evaluations_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`),
  ADD CONSTRAINT `committee_evaluations_ibfk_2` FOREIGN KEY (`evaluatee_id`) REFERENCES `evaluatees` (`id`),
  ADD CONSTRAINT `committee_evaluations_ibfk_3` FOREIGN KEY (`committee_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `committee_evaluations_ibfk_4` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`);

--
-- Constraints for table `committee_summary`
--
ALTER TABLE `committee_summary`
  ADD CONSTRAINT `committee_summary_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`),
  ADD CONSTRAINT `committee_summary_ibfk_2` FOREIGN KEY (`evaluatee_id`) REFERENCES `evaluatees` (`id`),
  ADD CONSTRAINT `committee_summary_ibfk_3` FOREIGN KEY (`committee_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `evaluatees`
--
ALTER TABLE `evaluatees`
  ADD CONSTRAINT `evaluatees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `evaluatees_ibfk_2` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`),
  ADD CONSTRAINT `evaluatees_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `evaluatees_ibfk_4` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`);

--
-- Constraints for table `evaluation_committee`
--
ALTER TABLE `evaluation_committee`
  ADD CONSTRAINT `evaluation_committee_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`),
  ADD CONSTRAINT `evaluation_committee_ibfk_2` FOREIGN KEY (`evaluatee_id`) REFERENCES `evaluatees` (`id`),
  ADD CONSTRAINT `evaluation_committee_ibfk_3` FOREIGN KEY (`committee_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `evaluation_results`
--
ALTER TABLE `evaluation_results`
  ADD CONSTRAINT `evaluation_results_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`),
  ADD CONSTRAINT `evaluation_results_ibfk_2` FOREIGN KEY (`evaluatee_id`) REFERENCES `evaluatees` (`id`);

--
-- Constraints for table `evaluation_scale`
--
ALTER TABLE `evaluation_scale`
  ADD CONSTRAINT `evaluation_scale_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`);

--
-- Constraints for table `evaluation_status`
--
ALTER TABLE `evaluation_status`
  ADD CONSTRAINT `evaluation_status_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`),
  ADD CONSTRAINT `evaluation_status_ibfk_2` FOREIGN KEY (`evaluatee_id`) REFERENCES `evaluatees` (`id`),
  ADD CONSTRAINT `evaluation_status_ibfk_3` FOREIGN KEY (`committee_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `evidences`
--
ALTER TABLE `evidences`
  ADD CONSTRAINT `evidences_ibfk_1` FOREIGN KEY (`evaluatee_id`) REFERENCES `evaluatees` (`id`),
  ADD CONSTRAINT `evidences_ibfk_2` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`);

--
-- Constraints for table `indicators`
--
ALTER TABLE `indicators`
  ADD CONSTRAINT `indicators_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`),
  ADD CONSTRAINT `indicators_ibfk_2` FOREIGN KEY (`topic_id`) REFERENCES `evaluation_topics` (`id`);

--
-- Constraints for table `indicator_references`
--
ALTER TABLE `indicator_references`
  ADD CONSTRAINT `indicator_references_ibfk_1` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `self_evaluations`
--
ALTER TABLE `self_evaluations`
  ADD CONSTRAINT `self_evaluations_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`),
  ADD CONSTRAINT `self_evaluations_ibfk_2` FOREIGN KEY (`evaluatee_id`) REFERENCES `evaluatees` (`id`),
  ADD CONSTRAINT `self_evaluations_ibfk_3` FOREIGN KEY (`indicator_id`) REFERENCES `indicators` (`id`);

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
