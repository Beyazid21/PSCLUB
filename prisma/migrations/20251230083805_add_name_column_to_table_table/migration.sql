/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Table" ADD COLUMN "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Table_name_key" ON "Table"("name");
