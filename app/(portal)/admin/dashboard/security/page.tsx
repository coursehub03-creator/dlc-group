import { changeAdminPasswordAction } from "../actions";
import { prisma } from "@/lib/db/prisma";

export default async function AdminSecurityPage() {
  let databaseConnected = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    databaseConnected = false;
  }

  const health = [
    ["Database connected", databaseConnected],
    ["Auth enabled", Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)],
    ["AI configured", Boolean(process.env.OPENAI_API_KEY)],
    ["Public contact enabled", true]
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Security & operations</h1>
      <div className="rounded-xl border bg-white p-4 text-sm">
        {health.map(([label, ok]) => <p key={label as string} className="flex justify-between border-b py-2"><span>{label as string}</span><span className={ok ? "text-emerald-700" : "text-rose-700"}>{ok ? "Healthy" : "Check required"}</span></p>)}
      </div>
      <form action={changeAdminPasswordAction} className="rounded-xl border bg-white p-4 text-sm">
        <h2 className="font-semibold">Change password</h2>
        <input type="password" name="newPassword" minLength={8} required placeholder="New password" className="mt-2 w-full rounded border px-3 py-2" />
        <button className="mt-2 rounded bg-navy px-3 py-2 text-white">Update password</button>
      </form>
    </div>
  );
}
