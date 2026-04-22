import { redirect } from "next/navigation";

export default async function AdminLegalRequestsAliasPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const lang = params.lang === "ar" ? "ar" : "en";
  redirect(`/admin/dashboard/requests?lang=${lang}`);
}
