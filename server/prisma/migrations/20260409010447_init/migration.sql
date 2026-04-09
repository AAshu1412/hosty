-- CreateEnum
CREATE TYPE "BuildStatus" AS ENUM ('pending', 'building', 'success', 'failed', 'failure');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "githubId" BIGINT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "email" TEXT,
    "accessToken" TEXT NOT NULL,
    "accessTokenExpiresIn" BIGINT NOT NULL,
    "refreshToken" TEXT,
    "refreshTokenExpiresIn" BIGINT,
    "tokenType" TEXT NOT NULL,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "nodeId" TEXT,
    "accountType" TEXT,
    "name" TEXT,
    "userViewType" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "notificationEmail" TEXT,
    "avatarUrl" TEXT,
    "htmlUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeployedRepo" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "subDirectory" TEXT,
    "branch" TEXT NOT NULL,
    "notificationEmail" TEXT,
    "hostedSiteUrl" TEXT NOT NULL,
    "currentStatus" "BuildStatus" NOT NULL DEFAULT 'pending',
    "currentBuildNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeployedRepo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Build" (
    "id" SERIAL NOT NULL,
    "repoId" INTEGER NOT NULL,
    "buildNumber" INTEGER NOT NULL,
    "status" "BuildStatus" NOT NULL,
    "buildLogs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");

-- AddForeignKey
ALTER TABLE "DeployedRepo" ADD CONSTRAINT "DeployedRepo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "DeployedRepo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
