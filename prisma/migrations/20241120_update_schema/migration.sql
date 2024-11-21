-- Drop existing tables and enums
DROP TABLE IF EXISTS "Todo";
DROP TYPE IF EXISTS "TodoCategory";
DROP TYPE IF EXISTS "Priority";
DROP TYPE IF EXISTS "Status";

-- CreateEnum
CREATE TYPE "TodoCategory" AS ENUM ('WORK', 'PERSONAL', 'SHOPPING', 'HEALTH', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'COMPLETE', 'PENDING', 'HOLD', 'SKIP');

-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "description" TEXT,
    "url" TEXT,
    "category" "TodoCategory" NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);
