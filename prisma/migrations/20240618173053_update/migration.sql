-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `token_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token_address` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `symbol` VARCHAR(191) NULL,
    `mint` VARCHAR(191) NULL,
    `traderPublicKey` VARCHAR(191) NULL,
    `txType` VARCHAR(191) NULL,
    `bondingCurveKey` VARCHAR(191) NULL,

    UNIQUE INDEX `token_info_token_address_key`(`token_address`),
    INDEX `token_info_token_address_idx`(`token_address`),
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
    `comment_id` INTEGER NOT NULL,

    UNIQUE INDEX `comment_comment_id_key`(`comment_id`),
    INDEX `comment_comment_id_idx`(`comment_id`),
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

    UNIQUE INDEX `trade_signature_key`(`signature`),
    INDEX `trade_signature_idx`(`signature`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
