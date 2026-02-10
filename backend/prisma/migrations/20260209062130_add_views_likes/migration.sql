-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_hotspots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "relevanceScore" REAL NOT NULL DEFAULT 0,
    "matchedKeywords" TEXT,
    "publishedAt" DATETIME,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_hotspots" ("content", "createdAt", "id", "matchedKeywords", "publishedAt", "relevanceScore", "source", "sourceUrl", "title") SELECT "content", "createdAt", "id", "matchedKeywords", "publishedAt", "relevanceScore", "source", "sourceUrl", "title" FROM "hotspots";
DROP TABLE "hotspots";
ALTER TABLE "new_hotspots" RENAME TO "hotspots";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
