-- Schema para Portal Cautivo Omada con Pago Móvil Bancomercantil
-- MariaDB/MySQL

-- Tabla de Planes disponibles
CREATE TABLE IF NOT EXISTS `plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `hours` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) DEFAULT 'VES',
  `description` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Transacciones de Pago
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` VARCHAR(100) UNIQUE NOT NULL,
  `client_mac` VARCHAR(17) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `plan_id` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) DEFAULT 'VES',
  `status` ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  `payment_method` VARCHAR(20) DEFAULT 'c2p',
  `payment_reference` VARCHAR(100),
  `invoice_number` VARCHAR(100),
  `mercantil_response` LONGTEXT,
  `error_message` TEXT,
  `error_code` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`),
  KEY `idx_client_mac` (`client_mac`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Sesiones WiFi Activas
CREATE TABLE IF NOT EXISTS `wifi_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(100) UNIQUE NOT NULL,
  `client_mac` VARCHAR(17) NOT NULL,
  `transaction_id` INT,
  `ap_mac` VARCHAR(17),
  `gateway_mac` VARCHAR(17),
  `ssid_name` VARCHAR(50),
  `radio_id` INT,
  `vid` INT,
  `plan_id` INT NOT NULL,
  `start_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `end_time` DATETIME,
  `duration_hours` INT NOT NULL,
  `status` ENUM('active', 'expired', 'cancelled', 'completed') DEFAULT 'active',
  `data_used_mb` BIGINT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`),
  FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`),
  KEY `idx_client_mac` (`client_mac`),
  KEY `idx_status` (`status`),
  KEY `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Usuarios/Clientes
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phone_number` VARCHAR(20) UNIQUE NOT NULL,
  `client_mac` VARCHAR(17),
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `email` VARCHAR(100),
  `total_spent` DECIMAL(15, 2) DEFAULT 0,
  `last_purchase_at` DATETIME,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_phone` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Códigos de Error Bancomercantil
CREATE TABLE IF NOT EXISTS `payment_errors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `error_code` VARCHAR(20) UNIQUE NOT NULL,
  `error_message` TEXT NOT NULL,
  `description_es` TEXT,
  `description_en` TEXT,
  `severity` ENUM('info', 'warning', 'error', 'critical') DEFAULT 'error',
  `retryable` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Auditoría
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(50) NOT NULL,
  `entity_type` VARCHAR(50),
  `entity_id` INT,
  `client_mac` VARCHAR(17),
  `action` VARCHAR(20),
  `old_value` LONGTEXT,
  `new_value` LONGTEXT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_event_type` (`event_type`),
  KEY `idx_client_mac` (`client_mac`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices para optimización
CREATE INDEX idx_transactions_phone ON `transactions`(`phone_number`);
CREATE INDEX idx_sessions_session_id ON `wifi_sessions`(`session_id`);
CREATE INDEX idx_users_mac ON `users`(`client_mac`);