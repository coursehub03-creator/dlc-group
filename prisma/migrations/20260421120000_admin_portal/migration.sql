-- Admin portal support fields
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "LegalRequest"
  ADD COLUMN "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
  ADD COLUMN "adminNote" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Notification"
  ADD COLUMN "senderId" TEXT,
  ADD COLUMN "audience" TEXT;

ALTER TABLE "ContactInquiry"
  ADD COLUMN "reviewedAt" TIMESTAMP(3),
  ADD COLUMN "adminNote" TEXT;

CREATE TABLE "SiteContent" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "bodyEn" TEXT,
  "bodyAr" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteContent_key_key" ON "SiteContent"("key");

ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
