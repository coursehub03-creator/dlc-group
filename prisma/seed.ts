import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.serviceCategory.createMany({
    data: [
      { slug: "general-legal-consultations", nameEn: "General Legal Consultations", nameAr: "الاستشارات القانونية العامة" },
      { slug: "corporate-legal-advisory", nameEn: "Corporate Legal Advisory", nameAr: "الاستشارات القانونية للشركات" },
      { slug: "land-dispute-resolution", nameEn: "Land Dispute Resolution", nameAr: "حل نزاعات الأراضي" }
    ],
    skipDuplicates: true
  });

  await prisma.user.upsert({
    where: { email: "admin@dlcgroup.online" },
    update: {},
    create: { email: "admin@dlcgroup.online", name: "DLC Admin", role: Prisma.RoleType.ADMIN }
  });

  await prisma.blogPost.createMany({
    data: [
      { slug: "corporate-governance-2026", titleEn: "Corporate Governance Priorities in 2026", titleAr: "أولويات حوكمة الشركات في 2026", bodyEn: "A practical framework for legal and compliance teams.", bodyAr: "إطار عملي لفرق الشؤون القانونية والامتثال.", category: "Compliance", featured: true },
      { slug: "trademark-pre-filing-checklist", titleEn: "Trademark Pre-Filing Checklist", titleAr: "قائمة التحقق قبل تسجيل العلامة التجارية", bodyEn: "How to reduce filing delays and objections.", bodyAr: "كيفية تقليل التأخير والاعتراضات قبل الإيداع.", category: "Intellectual Property" }
    ],
    skipDuplicates: true
  });
}

main().finally(() => prisma.$disconnect());
