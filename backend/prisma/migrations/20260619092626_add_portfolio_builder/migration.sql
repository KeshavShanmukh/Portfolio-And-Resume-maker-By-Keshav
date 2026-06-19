/*
  Warnings:

  - You are about to drop the column `bio` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `headline` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `links` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Portfolio` table. All the data in the column will be lost.
  - Added the required column `title` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PortfolioSection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "portfolioId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortfolioSection_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Portfolio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "builderType" TEXT NOT NULL DEFAULT 'DRAG_DROP',
    "meta" TEXT,
    "codeHtml" TEXT,
    "codeCss" TEXT,
    "codeJs" TEXT,
    "theme" TEXT DEFAULT 'default',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- Copy rows and provide defaults for new NOT NULL columns (title)
INSERT INTO "new_Portfolio" ("createdAt", "id", "updatedAt", "userId", "title", "description")
  SELECT "createdAt", "id", "updatedAt", "userId", COALESCE("fullName", 'Untitled'), COALESCE("bio", '') FROM "Portfolio";
DROP TABLE "Portfolio";
ALTER TABLE "new_Portfolio" RENAME TO "Portfolio";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
