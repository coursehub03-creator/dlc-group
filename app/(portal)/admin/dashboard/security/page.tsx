import { changeAdminPasswordAction } from "../actions";
import { prisma } from "@/lib/db/prisma";
import { getAdminLang } from "@/lib/admin/i18n";

export default async function AdminSecurityPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang: langValue } = await searchParams;
  const lang = getAdminLang(langValue);
  let databaseConnected = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    databaseConnected = false;
  }

  const health = [
    [lang === "ar" ? "اتصال قاعدة البيانات" : "Database connected", databaseConnected],
    [lang === "ar" ? "تفعيل المصادقة" : "Auth enabled", Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)],
    [lang === "ar" ? "إعداد الذكاء الاصطناعي" : "AI configured", Boolean(process.env.OPENAI_API_KEY)],
    [lang === "ar" ? "نموذج التواصل العام" : "Public contact enabled", true]
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">{lang === "ar" ? "الأمان والعمليات" : "Security & operations"}</h1>
      <div className="rounded-xl border bg-white p-4 text-sm">
        {health.map(([label, ok]) => <p key={label as string} className="flex justify-between border-b py-2"><span>{label as string}</span><span className={ok ? "text-emerald-700" : "text-rose-700"}>{ok ? (lang === "ar" ? "سليم" : "Healthy") : (lang === "ar" ? "يتطلب متابعة" : "Check required")}</span></p>)}
      </div>
      <form action={changeAdminPasswordAction} className="rounded-xl border bg-white p-4 text-sm">
        <h2 className="font-semibold">{lang === "ar" ? "تغيير كلمة المرور" : "Change password"}</h2>
        <input type="password" name="newPassword" minLength={8} required placeholder={lang === "ar" ? "كلمة المرور الجديدة" : "New password"} className="mt-2 w-full rounded border px-3 py-2" />
        <button className="mt-2 rounded bg-navy px-3 py-2 text-white">{lang === "ar" ? "تحديث كلمة المرور" : "Update password"}</button>
      </form>
    </div>
  );
}
