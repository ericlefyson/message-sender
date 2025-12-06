-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "userId1" TEXT NOT NULL,
    "userId2" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversations_roomId_key" ON "conversations"("roomId");

-- CreateIndex
CREATE INDEX "conversations_userId1_idx" ON "conversations"("userId1");

-- CreateIndex
CREATE INDEX "conversations_userId2_idx" ON "conversations"("userId2");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_userId1_userId2_key" ON "conversations"("userId1", "userId2");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId1_fkey" FOREIGN KEY ("userId1") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId2_fkey" FOREIGN KEY ("userId2") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
