-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `token_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_address` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `symbol` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` TEXT NULL,
    `user` VARCHAR(191) NULL,
    `timestamp` BIGINT NOT NULL,
    `username` VARCHAR(191) NULL,
    `total_likes` INTEGER NULL,
    `file_uri` VARCHAR(191) NULL,
    `token_address` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_address` VARCHAR(191) NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `timestamp` BIGINT NOT NULL,
    `username` VARCHAR(191) NULL,
    `sol_amount` DOUBLE NULL,
    `token_amount` DOUBLE NOT NULL,
    `tx_index` INTEGER NOT NULL,
    `signature` VARCHAR(191) NOT NULL,
    `is_buy` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
