-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Jan 27, 2026 at 03:03 AM
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
  `comment` text COLLATE utf8mb4_unicode_ci,
  `evaluated_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `committee_evaluations`
--

INSERT INTO `committee_evaluations` (`id`, `period_id`, `evaluatee_id`, `committee_user_id`, `indicator_id`, `score`, `comment`, `evaluated_at`) VALUES
(1, 2, 1, 8, 1, 2, 'ยังไม่มีหลักฐานว่ามาตรงต่อเวลาจริงหรือไม่', '2026-01-25 13:47:06'),
(2, 4, 1, 8, 5, 4, 'เห็นด้วยครับ คุณเเอนดรูมีความรับผิดชอบที่ดีมากเลยรคับ', '2026-01-26 07:27:28'),
(3, 5, 3, 11, 6, 4, 'ควรมีความซื้อสัตย์มากกว่านี้', '2026-01-26 08:23:27'),
(4, 5, 3, 11, 7, 4, '', '2026-01-26 08:23:27'),
(5, 5, 3, 11, 8, 4, '', '2026-01-26 08:23:27');

-- --------------------------------------------------------

--
-- Table structure for table `committee_summary`
--

CREATE TABLE `committee_summary` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `committee_user_id` int NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `signature_path` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'โปรแกรมเมอร์', '2026-01-13 06:18:34', '2026-01-26 08:29:13'),
(2, 'การตลาด', '2026-01-13 06:18:52', '2026-01-13 06:18:52'),
(5, 'การจัดการสำนักงาน', '2026-01-26 04:07:35', '2026-01-26 04:07:35'),
(6, 'ดิจิทัลกราฟฟิก', '2026-01-26 04:07:52', '2026-01-26 06:40:54'),
(7, 'การบัญชี', '2026-01-26 06:41:33', '2026-01-26 06:41:33');

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

--
-- Dumping data for table `evaluatees`
--

INSERT INTO `evaluatees` (`id`, `user_id`, `position_id`, `department_id`, `period_id`, `created_at`) VALUES
(1, 1, 2, 1, 2, '2026-01-21 05:25:16'),
(2, 10, 4, 1, 5, '2026-01-26 08:03:12'),
(3, 13, 1, 1, 5, '2026-01-26 08:17:12');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_committee`
--

CREATE TABLE `evaluation_committee` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `committee_user_id` int NOT NULL,
  `role` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_committee`
--

INSERT INTO `evaluation_committee` (`id`, `period_id`, `evaluatee_id`, `committee_user_id`, `role`) VALUES
(4, 2, 1, 8, NULL),
(5, 4, 1, 8, NULL),
(6, 5, 2, 11, NULL),
(7, 5, 3, 11, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_periods`
--

CREATE TABLE `evaluation_periods` (
  `id` int NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Pending','Start','Finish') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_periods`
--

INSERT INTO `evaluation_periods` (`id`, `name`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'รอบที่ 1/2567', '2026-01-20', '2026-01-23', 'Start', '2026-01-20 08:20:57', '2026-01-26 07:00:42'),
(2, 'รอบที่ 2/2567', '2026-01-25', '2026-01-30', 'Start', '2026-01-20 08:26:00', '2026-01-26 07:07:18'),
(4, 'รอบที่ 1/2568', '2026-01-26', '2026-01-30', 'Start', '2026-01-26 07:07:37', '2026-01-26 07:07:37'),
(5, 'รอบที่ 2/2578', '2026-01-26', '2026-01-31', 'Finish', '2026-01-26 07:51:32', '2026-01-26 07:51:47');

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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_scale`
--

INSERT INTO `evaluation_scale` (`id`, `period_id`, `value`, `name`, `created_at`, `updated_at`) VALUES
(3, 1, 1, 'แย่', '2026-01-20 10:16:06', '2026-01-20 10:16:06'),
(4, 1, 2, 'พอใช้', '2026-01-20 10:16:23', '2026-01-20 10:16:23'),
(5, 1, 3, 'ดี', '2026-01-20 10:16:58', '2026-01-20 10:16:58'),
(7, 2, 1, 'เเย่', '2026-01-25 13:44:05', '2026-01-25 13:44:05'),
(8, 2, 2, 'พอใช้', '2026-01-25 13:44:13', '2026-01-25 13:44:13'),
(9, 2, 3, 'ดี', '2026-01-25 13:44:21', '2026-01-25 13:44:21'),
(10, 2, 4, 'ดีมาก', '2026-01-25 13:44:32', '2026-01-25 13:44:32'),
(12, 4, 1, 'เเย่', '2026-01-26 07:09:33', '2026-01-26 07:09:33'),
(13, 4, 2, 'พอใช้', '2026-01-26 07:09:43', '2026-01-26 07:09:43'),
(14, 4, 3, 'ดี', '2026-01-26 07:09:51', '2026-01-26 07:09:51'),
(15, 4, 4, 'ดีมาก', '2026-01-26 07:09:57', '2026-01-26 07:09:57'),
(17, 5, 1, 'ปฏิบัติได้ต่ำกว่าระดับ การปฏิบัติที่คาดหวังมาก', '2026-01-26 07:56:33', '2026-01-26 07:56:48'),
(18, 5, 2, 'ปฏิบัติได้ต่ำกว่า ระดับการปฏิบัติที่คาดหวัง', '2026-01-26 07:58:22', '2026-01-26 07:58:22'),
(19, 5, 3, 'ปฏิบัติได้ตาม ระดับการปฏิบัติที่คาดหวัง', '2026-01-26 07:58:47', '2026-01-26 07:58:47'),
(20, 5, 4, 'ปฏิบัติได้สูงกว่า ระดับการปฏิบัติที่คาดหวัง', '2026-01-26 07:59:00', '2026-01-26 07:59:00');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_status`
--

CREATE TABLE `evaluation_status` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `committee_user_id` int NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_topics`
--

CREATE TABLE `evaluation_topics` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_topics`
--

INSERT INTO `evaluation_topics` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(2, 'ประเมิณบุลลากร', 'การประเมิณบุลลากรของเรา', '2026-01-20 08:21:18', '2026-01-20 08:21:18'),
(3, 'ด้านคุณธรรมจริยธรรม', 'ความมีเมตตากรุณาต่อสัตย์', '2026-01-26 07:51:05', '2026-01-26 07:51:05');

-- --------------------------------------------------------

--
-- Table structure for table `evidences`
--

CREATE TABLE `evidences` (
  `id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `indicator_id` int NOT NULL,
  `file_path` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `url` text COLLATE utf8mb4_unicode_ci,
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
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `weight` decimal(5,2) NOT NULL,
  `required_evidence` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `indicators`
--

INSERT INTO `indicators` (`id`, `period_id`, `topic_id`, `name`, `description`, `weight`, `required_evidence`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 'ความตรงต่อเวลา', 'บุคลากรมาสายเเละตรงต่อเวลาหรือไม่', 40.00, 1, '2026-01-20 08:23:29', '2026-01-26 07:10:14'),
(5, 4, 2, 'ความรับผิดชอบ', 'ไม่รู้จะอธิบายอย่างไร', 20.00, 1, '2026-01-26 07:10:06', '2026-01-26 07:10:06'),
(6, 5, 3, '1.1 ความซื้อสัตย์', '', 20.00, 1, '2026-01-26 07:59:06', '2026-01-26 07:59:06'),
(7, 5, 3, '1.2 ความมีวินัย', '', 10.00, 1, '2026-01-26 08:20:32', '2026-01-26 08:20:32'),
(8, 5, 3, '1.3 ความตรงต่อเวลา', '', 15.00, 1, '2026-01-26 08:20:56', '2026-01-26 08:20:56');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'หัวหน้าแผนก', '2026-01-13 06:17:45', '2026-01-13 06:17:45'),
(2, 'รองหัวหน้าแผนก', '2026-01-13 06:17:59', '2026-01-13 06:17:59'),
(3, 'ครูผู้สอนประจำวิชา', '2026-01-13 06:18:10', '2026-01-13 06:18:10'),
(4, 'ผู้อำนวยการ', '2026-01-26 07:10:32', '2026-01-26 07:10:32'),
(5, 'รองผู้อำนวยการ', '2026-01-26 07:10:39', '2026-01-26 07:10:39');

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
  `comment` text COLLATE utf8mb4_unicode_ci,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `self_evaluations`
--

INSERT INTO `self_evaluations` (`id`, `period_id`, `evaluatee_id`, `indicator_id`, `score`, `comment`, `updated_at`) VALUES
(1, 1, 1, 1, 3, 'ควย', '2026-01-25 11:15:44'),
(2, 2, 1, 1, 1, 'เพราะว่าผมมาตรงต่อเวลาตลาดเลยครับ', '2026-01-26 07:01:24'),
(3, 4, 1, 5, 4, 'มีความรับผิดชอบต่อหน้าที่เป็นอย่างดี', '2026-01-26 07:25:54'),
(4, 5, 3, 6, 4, '', '2026-01-26 08:18:52');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `prefix` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('Personnel','Evaluatees','Evaluator') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `prefix`, `first_name`, `last_name`, `password`, `email`, `phone`, `role`, `created_at`) VALUES
(1, NULL, 'Alexander', 'Souller', '$2b$10$60R/RYrFNmrSUWepKrB82..74WGlwiDKFjoIkafUrEDJirqG.Pdl2', 'andruw@gmail.com', NULL, 'Evaluatees', '2026-01-05 06:23:36'),
(2, 'นาย', 'อันดูว์', 'ซูเลม', '$2b$10$ezG6FIjm5bO3titPp/A43O93BV3QT01JmbKVdjgKX4ivxxAf7Yag.', 'nateeandu77@gmail.com', '0612627319', 'Evaluatees', '2026-01-14 03:30:42'),
(3, 'Mr', 'Alexander', 'Souller', '$2b$10$Vn9K/09J5/IesG8/v5f0c.TudujM1DM/S9j3bpvXIZ.wQhNX0zj6O', 'alexander@gmail.com', '0612627319', 'Evaluatees', '2026-01-14 03:32:44'),
(4, 'Mr', 'Lyka', 'Howdy', '$2b$10$crm4c/OfJZO4HqpAiMU3Xe9CkmDwvNP0PWENxENFROkqG6QstNPYS', 'lyka@gmail.com', '0612627319', 'Evaluatees', '2026-01-19 03:03:05'),
(5, NULL, 'Admin', 'Personnel', '$2b$10$zrhvz2T21Xg9AaXGLs/CteGqDmjq256kp7heVCLx22.CpJ.ZdQwK2', 'admin@gmail.com', NULL, 'Personnel', '2026-01-19 05:08:10'),
(6, 'Mr', 'Phuthiphong', 'Santhitiphong', '$2b$10$.n/tCTj/BwbvWG/OwR3SP.T7deLoi4i4qiZNUpuaq9jDyfrUkYNy2', 'vatvghjkl2@gmail.com', NULL, 'Personnel', '2026-01-19 05:26:51'),
(7, 'Mr', 'Phuthiphong', 'Santhitiphong', '$2b$10$WNxrtuqsN8g8Yl4AmBxYf.cM0pSUQBiQOeCBbtdty1ei1R4fEhZCG', 'vatvghjkl3@gmail.com', '0629069091', 'Personnel', '2026-01-19 05:27:30'),
(8, 'นาย', 'กรรมการ', 'ยอดเยี่ยม', '$2b$10$3jya.eF0scXZcjNtO5akrOY.Q3ClSm.7vuqFWrUtDvIJope8oKqym', 'committee@gmail.com', '0612627319', 'Evaluator', '2026-01-20 09:34:34'),
(9, 'นาย', 'พุฒิพงศ์', 'สัณฐิติพงศ์', '$2b$10$gL6wJuXYSGlzCl6chWC6Fe.d/vcLlaflaRy5T3hG/.O5rAJ2A71NS', 'testuser01@gmail.com', '1234561234', 'Personnel', '2026-01-26 04:23:36'),
(10, 'นาง', 'พุฒิพงศ์', 'สันฐิติพงศ์', '$2b$10$KnbKONzMi8Bg/RaX9PtSdeFrek..0Z/bRrcoZUXiB.ds3PKmeY8ty', 'phutipong@gmail.com', '0628271611', 'Evaluatees', '2026-01-26 07:46:43'),
(11, 'นาย', 'โด้', 'นอนตื่นสาย', '$2b$10$FUxJ7phCB2vhlWnZzZoCROK4EOsY5t1O9B3FX.z9cq1NK.Ypm1lge', 'doo@gmail.com', '0612627319', 'Evaluator', '2026-01-26 08:04:10'),
(12, 'นาง', 'test', 'test', '$2b$10$2HyxMsRYnXoyv/nXmeo3reVN9Zh7LEpYL9BeC6J3STPFUhheP9BSe', 'test@gmail.com', '123', 'Evaluatees', '2026-01-26 08:15:11'),
(13, NULL, 'Andruw', 'Solem', '$2b$10$DjUzE6X4HoaqXyv/QrnQAeq7SEVny3OjxBqm/fbwKHTjLtolQ7tiS', 'andu@gmail.com', NULL, 'Evaluatees', '2026-01-26 08:15:56');

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `committee_summary`
--
ALTER TABLE `committee_summary`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `evaluatees`
--
ALTER TABLE `evaluatees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `evaluation_committee`
--
ALTER TABLE `evaluation_committee`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `evaluation_periods`
--
ALTER TABLE `evaluation_periods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `evaluation_results`
--
ALTER TABLE `evaluation_results`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_scale`
--
ALTER TABLE `evaluation_scale`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `evaluation_status`
--
ALTER TABLE `evaluation_status`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_topics`
--
ALTER TABLE `evaluation_topics`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `evidences`
--
ALTER TABLE `evidences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `indicators`
--
ALTER TABLE `indicators`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `self_evaluations`
--
ALTER TABLE `self_evaluations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
