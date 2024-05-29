/*
  Warnings:

  - A unique constraint covering the columns `[comment_id]` on the table `comment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_address]` on the table `token_info` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[signature]` on the table `trade` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `comment_id` to the `comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `comment` ADD COLUMN `comment_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `comment_comment_id_key` ON `comment`(`comment_id`);

-- CreateIndex
CREATE INDEX `comment_comment_id_idx` ON `comment`(`comment_id`);

-- CreateIndex
CREATE UNIQUE INDEX `token_info_token_address_key` ON `token_info`(`token_address`);

-- CreateIndex
CREATE INDEX `token_info_token_address_idx` ON `token_info`(`token_address`);

-- CreateIndex
CREATE UNIQUE INDEX `trade_signature_key` ON `trade`(`signature`);

-- CreateIndex
CREATE INDEX `trade_signature_idx` ON `trade`(`signature`);
