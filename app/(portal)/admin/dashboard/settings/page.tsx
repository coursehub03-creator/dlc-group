import { updateAdminProfileAction } from "../actions";
import { requireAdminUser } from "@/lib/admin/guard";
import { prisma } from "@/lib/db/prisma";
import { getAdminLang } from "@/lib/admin/i18n";

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang: langValue } = await searchParams;
  const lang = getAdminLang(langValue);
  const admin = await requireAdminUser();
  const profile = await prisma.profile.findUnique({ where: { userId: admin.id } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">{lang === "ar" ? "إعدادات الإدارة" : "Admin settings"}</h1>
      <form action={updateAdminProfileAction} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-2">
        <input name="name" defaultValue={admin.name ?? ""} placeholder={lang === "ar" ? "الاسم الكامل" : "Full name"} className="rounded border px-3 py-2 text-sm" required />
        <input name="phone" defaultValue={profile?.phone ?? ""} placeholder={lang === "ar" ? "الهاتف" : "Phone"} className="rounded border px-3 py-2 text-sm" />
        <input name="country" defaultValue={profile?.country ?? ""} placeholder={lang === "ar" ? "الدولة" : "Country"} className="rounded border px-3 py-2 text-sm" />
        <select name="language" defaultValue={profile?.language ?? "ar"} className="rounded border px-3 py-2 text-sm"><option value="ar">العربية</option><option value="en">English</option></select>
        <button className="rounded bg-navy px-3 py-2 text-sm text-white">{lang === "ar" ? "حفظ الإعدادات" : "Save settings"}</button>
      </form>
    </div>
  );
}
