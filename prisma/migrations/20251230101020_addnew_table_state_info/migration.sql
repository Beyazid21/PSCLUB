-- CreateTable
CREATE TABLE "StateInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantName" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "allowedRadius" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
