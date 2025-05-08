/*
  Warnings:

  - You are about to drop the `Developer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Developer";

-- CreateTable
CREATE TABLE "developer" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player" (
    "id" SERIAL NOT NULL,
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "developerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" SERIAL NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "winnerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomCode" TEXT NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developer_email_key" ON "developer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "developer_apiKey_key" ON "developer"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "match_roomCode_key" ON "match"("roomCode");

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
