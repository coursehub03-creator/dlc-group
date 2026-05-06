-- Add lightweight smart-memory fields and first-class AI file attachments without resetting data.
ALTER TABLE "AIConversation" ADD COLUMN IF NOT EXISTS "mode" TEXT;
ALTER TABLE "AIConversation" ADD COLUMN IF NOT EXISTS "summary" TEXT;

CREATE TABLE IF NOT EXISTS "AIFile" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "extractedText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIFile_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");
CREATE INDEX IF NOT EXISTS "AIFile_conversationId_createdAt_idx" ON "AIFile"("conversationId", "createdAt");
CREATE INDEX IF NOT EXISTS "AIFile_userId_createdAt_idx" ON "AIFile"("userId", "createdAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'AIFile_conversationId_fkey'
    ) THEN
        ALTER TABLE "AIFile" ADD CONSTRAINT "AIFile_conversationId_fkey"
        FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'AIFile_userId_fkey'
    ) THEN
        ALTER TABLE "AIFile" ADD CONSTRAINT "AIFile_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
