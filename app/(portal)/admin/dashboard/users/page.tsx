import { Prisma, RoleType } from "@prisma/client";
import { updateUserAction } from "../actions";
import { prisma } from "@/lib/db/prisma";
import { adminText, getAdminLang, localeFor } from "@/lib/admin/i18n";
import { withSafeAdminQuery } from "@/lib/admin/guard";

type UsersSearchParams = Promise<{ q?: string; role?: string; lang?: string }>;

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: RoleType;
  isActive: boolean;
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
  return Object.values(RoleType).includes(value as RoleType) ? (value as RoleType) : undefined;
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

async function getUsers(q: string, role: RoleType | undefined): Promise<UserRow[]> {
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
    () =>
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        take: USERS_TAKE_LIMIT
      }),
    [] as Array<{
      id: string;
      email: string;
      name: string | null;
      role: RoleType;
      isActive: boolean;
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

  const users = await getUsers(q, role);

  const fallbackName = lang === "ar" ? "مستخدم بدون اسم" : "Unnamed user";
  const tableHeaders = {
    name: lang === "ar" ? "الاسم" : "Name",
    email: lang === "ar" ? "البريد الإلكتروني" : "Email",
    phone: lang === "ar" ? "الهاتف" : "Phone",
    country: lang === "ar" ? "الدولة" : "Country",
    role: lang === "ar" ? "الدور" : "Role",
    active: lang === "ar" ? "الحالة" : "Status",
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
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.active}</th>
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.created}</th>
                <th className="px-3 py-2 text-start font-semibold">{tableHeaders.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-3">{user.name?.trim() || fallbackName}</td>
                  <td className="px-3 py-3 text-slate-600">{user.email}</td>
                  <td className="px-3 py-3">{user.profile?.phone?.trim() || "-"}</td>
                  <td className="px-3 py-3">{user.profile?.country?.trim() || "-"}</td>
                  <td className="px-3 py-3">{user.role || "CLIENT"}</td>
                  <td className="px-3 py-3">{user.isActive ? (lang === "ar" ? "نشط" : "Active") : lang === "ar" ? "غير نشط" : "Inactive"}</td>
                  <td className="px-3 py-3">{formatCreatedAt(user.createdAt, lang)}</td>
                  <td className="px-3 py-3">
                    <form action={updateUserAction} className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                      <input type="hidden" name="userId" value={user.id} />
                      <input name="name" defaultValue={user.name?.trim() || fallbackName} className="rounded border px-3 py-2 text-sm" required />
                      <select name="role" defaultValue={user.role || "CLIENT"} className="rounded border px-3 py-2 text-sm">
                        {Object.values(RoleType).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
                        <input type="checkbox" name="isActive" defaultChecked={Boolean(user.isActive)} />
                        {lang === "ar" ? "نشط" : "Active"}
                      </label>
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
