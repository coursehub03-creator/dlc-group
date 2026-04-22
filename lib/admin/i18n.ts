export type AdminLang = "en" | "ar";

export const getAdminLang = (value?: string | null): AdminLang => (value === "ar" ? "ar" : "en");
export const isArabic = (lang: AdminLang) => lang === "ar";
export const localeFor = (lang: AdminLang) => (lang === "ar" ? "ar-SA" : "en-US");

export const adminI18n = {
  en: {
    nav: {
      overview: "Overview",
      users: "Users",
      requests: "Legal Requests",
      support: "Support",
      notifications: "Notifications",
      contact: "Contact Inquiries",
      categories: "Service Categories",
      activity: "Activity Log",
      content: "Content / CMS",
      settings: "Settings",
      security: "Security"
    },
    common: {
      adminPortal: "Admin Portal",
      operations: "DLC Operations",
      administrator: "Administrator",
      logout: "Logout",
      filter: "Filter",
      search: "Search",
      save: "Save",
      update: "Update",
      delete: "Delete",
      none: "none",
      noData: "No data available",
      markRead: "Mark read",
      markUnread: "Mark unread",
      open: "Open"
    },
    status: {
      NEW: "New",
      UNDER_REVIEW: "Under review",
      IN_PROGRESS: "In progress",
      COMPLETED: "Completed",
      NEEDS_CLARIFICATION: "Needs clarification",
      CLOSED: "Closed"
    }
  },
  ar: {
    nav: {
      overview: "نظرة عامة",
      users: "المستخدمون",
      requests: "الطلبات القانونية",
      support: "الدعم",
      notifications: "الإشعارات",
      contact: "استفسارات التواصل",
      categories: "تصنيفات الخدمات",
      activity: "سجل النشاط",
      content: "إدارة المحتوى",
      settings: "الإعدادات",
      security: "الأمان"
    },
    common: {
      adminPortal: "بوابة الإدارة",
      operations: "عمليات DLC",
      administrator: "مسؤول النظام",
      logout: "تسجيل الخروج",
      filter: "تصفية",
      search: "بحث",
      save: "حفظ",
      update: "تحديث",
      delete: "حذف",
      none: "لا يوجد",
      noData: "لا توجد بيانات",
      markRead: "تعيين كمقروء",
      markUnread: "تعيين كغير مقروء",
      open: "فتح"
    },
    status: {
      NEW: "جديد",
      UNDER_REVIEW: "قيد المراجعة",
      IN_PROGRESS: "قيد التنفيذ",
      COMPLETED: "مكتمل",
      NEEDS_CLARIFICATION: "بحاجة لتوضيح",
      CLOSED: "مغلق"
    }
  }
} as const;

export function adminText(lang: AdminLang) {
  return adminI18n[lang];
}
