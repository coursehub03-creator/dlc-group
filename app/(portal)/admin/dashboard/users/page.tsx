import { Prisma, RoleType } from "@prisma/client";
import { updateUserAction } from "../actions";
import { prisma } from "@/lib/db/prisma";
import { adminText, getAdminLang, localeFor } from "@/lib/admin/i18n";
import { withSafeAdminQuery } from "@/lib/admin/guard";

type UsersSearchParams = Promise<{ q?: string; role?: string; page?: string; lang?: string; error?: string }>;

type UserRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: RoleType | null;
  createdAt: Date;
  profile: {
    phone: string | null;
    country: string | null;
    language: string;
  } | null;
};

const USERS_TAKE_LIMIT = 60;

function resolveRoleFilter(value?: string): RoleType | undefined {
  if (!value) return undefined;

  const roleParam = value.trim().toUpperCase();
  return roleParam === "ADMIN" || roleParam === "CLIENT" || roleParam === "LEGAL_STAFF" || roleParam === "GUEST"
    ? (roleParam as RoleType)
    : undefined;
}

const roleLabels = {
  GUEST: { en: "Guest", ar: "زائر" },
  CLIENT: { en: "Client", ar: "عميل" },
  LEGAL_STAFF: { en: "Legal Staff", ar: "فريق قانوني" },
  ADMIN: { en: "Admin", ar: "مدير" }
} as const;

function getRoleLabel(role: RoleType | null | undefined, locale: "en" | "ar") {
  if (!role) return roleLabels.CLIENT[locale];
  return roleLabels[role]?.[locale] ?? role ?? roleLabels.CLIENT[locale];
}

function formatCreatedAt(value: Date | null | undefined, lang: "en" | "ar") {
  if (!value || Number.isNaN(value.getTime())) return "-";

  try {
    return new Intl.DateTimeFormat(localeFor(lang), {
      year: "numeric",
      month: "short",
      day: "2-digit"
    }).format(value);
  } catch {
    return "-";
  }
}

async function getUsers(q: string, role: RoleType | undefined, page: number): Promise<UserRow[]> {
  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(role ? { role } : {})
  };

  const usersWithoutProfile = await withSafeAdminQuery(
    async () => {
      try {
        return await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * USERS_TAKE_LIMIT,
        take: USERS_TAKE_LIMIT
      });
      } catch (error) {
        console.error("[admin-users] failed to load users", error);
        throw error;
      }
    },
    [] as Array<{
      id: string;
      email: string;
      name: string | null;
      role: RoleType;
      createdAt: Date;
    }>
  );

  if (usersWithoutProfile.length === 0) {
    return [];
  }

  const profileRows = await withSafeAdminQuery(
    () =>
      prisma.profile.findMany({
        where: { userId: { in: usersWithoutProfile.map((u) => u.id) } },
        select: { userId: true, phone: true, country: true, language: true }
      }),
    [] as Array<{ userId: string; phone: string | null; country: string | null; language: string }>
  );

  const profileByUserId = new Map(profileRows.map((p) => [p.userId, p]));

  return usersWithoutProfile.map((user) => ({
    ...user,
    profile: profileByUserId.get(user.id)
      ? {
          phone: profileByUserId.get(user.id)?.phone ?? null,
          country: profileByUserId.get(user.id)?.country ?? null,
          language: profileByUserId.get(user.id)?.language ?? "en"
        }
      : null
  }));
}

export default async function AdminUsersPage({ searchParams }: { searchParams: UsersSearchParams }) {
  const params = await searchParams;
  const lang = getAdminLang(params.lang);
  const t = adminText(lang);

  const q = params.q?.trim() ?? "";
  const role = resolveRoleFilter(params.role);
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const error = typeof params.error === "string" ? params.error : "";

  const users = await getUsers(q, role, page);

  const fallbackName = lang === "ar" ? "مستخدم بدون اسم" : "Unnamed user";
  const tableHeaders = {
    name: lang === "ar" ? "الاسم" : "Name",
    email: lang === "ar" ? "البريد الإلكتروني" : "Email",
    phone: lang === "ar" ? "الهاتف" : "Phone",
    country: lang === "ar" ? "الدولة" : "Country",
    role: lang === "ar" ? "الدور" : "Role",
    created: lang === "ar" ? "تاريخ الإنشاء" : "Created",
    actions: lang === "ar" ? "إجراءات" : "Actions"
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">{lang === "ar" ? "إدارة المستخدمين" : "Users Management"}</h1>

      <form className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder={lang === "ar" ? "ابحث بالاسم أو البريد الإلكتروني" : "Search by name or email"}
          className="rounded border px-3 py-2 text-sm"
        />
        <input type="hidden" name="lang" value={lang} />
        <select name="role" defaultValue={role ?? ""} className="rounded border px-3 py-2 text-sm">
          <option value="">{lang === "ar" ? "كل الأدوار" : "All roles"}</option>
          {Object.values(RoleType).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button className="rounded bg-navy px-3 py-2 text-sm font-semibold text-white">{t.common.filter}</button>
      </form>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error === "invalid_role"
            ? lang === "ar"
              ? "قيمة الدور غير صالحة. يرجى اختيار دور صحيح."
              : "Invalid role value submitted. Please choose a valid role."
            : lang === "ar"
              ? "تعذر تحديث المستخدم. تحقق من البيانات ثم أعد المحاولة."
              : "We could not update this user. Please review the data and try again."}
        </div>
      ) : null}

      <div className="text-sm text-slate-600">{lang === "ar" ? `عرض ${users.length} مستخدم` : `Showing ${users.length} users`}</div>

      {users.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-slate-500">
          {lang === "ar" ? "لا يوجد مستخدمون مطابقون للبحث أو الفلتر الحالي." : "No users found for the current search or filter."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.name}</th>
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.email}</th>
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.phone}</th>
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.country}</th>
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.role}</th>
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.created}</th>
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-3">{user.name?.trim() || fallbackName}</td>
                  <td className="px-3 py-3 text-slate-600">{user.email?.trim() || "-"}</td>
                  <td className="px-3 py-3">{user.profile?.phone?.trim() || "-"}</td>
                  <td className="px-3 py-3">{user.profile?.country?.trim() || "-"}</td>
                  <td className="px-3 py-3">{getRoleLabel(user.role, lang)}</td>
                  <td className="px-3 py-3">{formatCreatedAt(user.createdAt, lang)}</td>
                  <td className="px-3 py-3">
                    <form action={updateUserAction} className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                      <input type="hidden" name="userId" value={user.id} />
                      <input name="name" defaultValue={user.name ?? ""} placeholder={fallbackName} className="rounded border px-3 py-2 text-sm" />
                      <select name="role" defaultValue={user.role ?? "CLIENT"} className="rounded border px-3 py-2 text-sm">
                        <option value="GUEST">{getRoleLabel("GUEST", lang)}</option>
                        <option value="CLIENT">{getRoleLabel("CLIENT", lang)}</option>
                        <option value="LEGAL_STAFF">{getRoleLabel("LEGAL_STAFF", lang)}</option>
                        <option value="ADMIN">{getRoleLabel("ADMIN", lang)}</option>
                      </select>
                      <input type="hidden" name="lang" value={lang} />
                      <button className="rounded bg-gold px-3 py-2 text-sm font-semibold text-navy md:col-span-3">{t.common.save}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
