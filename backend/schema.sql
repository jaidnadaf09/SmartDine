-- MySQL Dump for SmartDine Database
-- Run these commands to manually create the database and tables if Sequelize sync is not used.

CREATE DATABASE IF NOT EXISTS smartdine;
USE smartdine;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NULL,
  `role` ENUM('customer', 'admin', 'CHEF', 'WAITER') DEFAULT 'customer',
  `shift` ENUM('Morning', 'Evening') NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `tables`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tables` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tableNumber` INT NOT NULL UNIQUE,
  `capacity` INT NOT NULL,
  `status` ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
  `orders` INT DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `menu_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('available', 'unavailable') DEFAULT 'available',
  `description` TEXT NULL,
  `image` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `inventory_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventory_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(255) NOT NULL,
  `status` ENUM('sufficient', 'low', 'critical') DEFAULT 'sufficient',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `bookings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customerName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `date` DATETIME NOT NULL,
  `time` VARCHAR(255) NOT NULL,
  `guests` INT NOT NULL,
  `tableNumber` INT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  `specialRequests` TEXT NULL,
  `userId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table `orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tableNumber` INT NOT NULL,
  `status` ENUM('pending', 'preparing', 'ready', 'delivered') DEFAULT 'pending',
  `totalAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `timeStarted` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- -----------------------------------------------------
-- Table `order_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orderId` INT NOT NULL,
  `itemName` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `status` ENUM('pending', 'preparing', 'ready', 'delivered') DEFAULT 'pending',
  `assignedChef` INT NULL,
  `estimatedTime` INT DEFAULT 5,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`assignedChef`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Insert dummy admin directly for reference
-- INSERT INTO `users` (`name`, `email`, `password`, `role`, `status`) VALUES ('Admin User', 'admin@smartdine.com', '$2b$10$wT/c7n8W0y5Yk/w9v28Fau.S3J.iO3i9M7A6l/.U6wB/2H.2sO4K2', 'admin', 'active');
