export type Locale = "ar" | "en";

export const dictionaries = {
  en: {
    dir: "ltr",
    nav: ["Home", "About", "Services", "AI Assistant", "Blog", "Contact"],
    heroTitle: "Strategic legal advisory for business and individuals",
    heroSubtitle: "Premium legal consulting, intellectual property support, and proactive compliance monitoring.",
    cta: { consult: "Book Consultation", ai: "Talk to AI Assistant", services: "Explore Services" }
  },
  ar: {
    dir: "rtl",
    nav: ["الرئيسية", "من نحن", "الخدمات", "المساعد الذكي", "المدونة", "تواصل معنا"],
    heroTitle: "استشارات قانونية استراتيجية للأفراد والشركات",
    heroSubtitle: "حلول قانونية احترافية مع دعم الملكية الفكرية والمتابعة التنظيمية.",
    cta: { consult: "احجز استشارة", ai: "تحدث مع المساعد الذكي", services: "استكشف الخدمات" }
  }
} as const;
