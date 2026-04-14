export type ServiceItem = {
  slug: string;
  titleEn: string;
  descriptionEn: string;
  titleAr: string;
  descriptionAr: string;
};

export const services: ServiceItem[] = [
  {
    slug: "general-legal-consultations",
    titleEn: "General Legal Consultations",
    descriptionEn: "Professional legal consultations for individuals and businesses.",
    titleAr: "الاستشارات القانونية العامة",
    descriptionAr: "استشارات قانونية للأفراد والشركات."
  },
  {
    slug: "corporate-legal-advisory",
    titleEn: "Corporate Legal Advisory",
    descriptionEn: "Legal advisory for companies and business structures.",
    titleAr: "الاستشارات القانونية للشركات",
    descriptionAr: "استشارات قانونية للشركات."
  },
  {
    slug: "land-dispute-resolution",
    titleEn: "Land Dispute Resolution",
    descriptionEn: "Resolve land and property conflicts.",
    titleAr: "حل نزاعات الأراضي",
    descriptionAr: "حل نزاعات الأراضي والعقارات."
  }
];
