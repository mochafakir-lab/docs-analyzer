CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`file_path` text NOT NULL,
	`status` text DEFAULT 'processing' NOT NULL,
	`upload_date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
