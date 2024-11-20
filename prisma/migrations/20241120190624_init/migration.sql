-- CreateEnum
CREATE TYPE "TodoCategory" AS ENUM ('Event', 'Reminder', 'Someday', 'Now');

-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "category" "TodoCategory" NOT NULL DEFAULT 'Now',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);
